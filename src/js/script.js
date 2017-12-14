import 'babel-polyfill'; //eslint-disable-line

import {Array3D, GPGPUContext, gpgpu_util, render_ndarray_gpu_util, NDArrayMathCPU, NDArrayMathGPU} from 'deeplearn'; //eslint-disable-line
import TransformNet from './net';

import VR from './classes/vr.js';

const STYLE_MAPPINGS = {
  'Udnie, Francis Picabia': `udnie`,
  'The Scream, Edvard Munch': `scream`,
  'La Muse, Pablo Picasso': `la_muse`,
  'Rain Princess, Leonid Afremov': `rain_princess`,
  'The Wave, Katsushika Hokusai': `wave`,
  'The Wreck of the Minotaur, J.M.W. Turner': `wreck`
};

const init = () => {
  const canvas = document.querySelector(`.imageCanvas`);
  const gl = gpgpu_util.createWebGLContext(canvas); //eslint-disable-line
  const gpgpu = new GPGPUContext(gl);
  const math = new NDArrayMathGPU(gpgpu);
  const mathCPU = new NDArrayMathCPU(); //eslint-disable-line

  const aboutText = document.querySelector(`.about-txt`);
  const aboutBtnStart = document.querySelector(`.start-btn`);
  const logoAnim = document.querySelector(`.stranger-logo`);
  const backBtn = document.querySelector(`.back-btn`);

  const contentImgElement = document.querySelector(`.contentImg`);

  contentImgElement.src = `../assets/img/stata.jpg`;
  contentImgElement.height = 250;

  const selectedStyleName = STYLE_MAPPINGS[`The Wreck of the Minotaur, J.M.W. Turner`];

  const transformNet = new TransformNet(math, STYLE_MAPPINGS[selectedStyleName]);

  const fileSelect = document.querySelector(`.fileSelect`);
  fileSelect.addEventListener(`change`, e => {
    const f = e.target.files[0];
    const fileReader = new FileReader();
    fileReader.addEventListener(`load`, e => {
      const target = e.target;
      contentImgElement.src = target.result;
    });
    fileReader.readAsDataURL(f);
    fileSelect.value = ``;
  });

  const startButton = document.querySelector(`.start`);
  startButton.addEventListener(`click`, () => {
    transformNet.setStyle(selectedStyleName);
    const spinner = document.querySelector(`.spinner`);
    spinner.classList.remove(`hide`);
    imageDone();

    transformNet.load().then(
      () => {
        startButton.innerText = `Processing image`;
        runInference();
        startButton.innerText = `Start style transfer button`;
        startButton.disabled = false;
        spinner.classList.add(`hide`);
      }
    ).catch(error => {
      console.log(error);
      startButton.innerText = `Start style transfer`;
      startButton.disabled = false;
    });
  });

  const imageDone = () => {
    aboutText.classList.add(`hide`);
    aboutBtnStart.classList.add(`hide`);
    logoAnim.classList.add(`logo-reversefade`);
  };

  const runInference = async () => {
    await math.scope(async (keep, track) => {
      const preprocessed = track(Array3D.fromPixels(contentImgElement));

      const inferenceResult = await transformNet.predict(preprocessed);
      setCanvasShape(inferenceResult.shape);
      const renderShader = render_ndarray_gpu_util.getRenderRGBShader( //eslint-disable-line
          gpgpu, inferenceResult.shape[1]);
      render_ndarray_gpu_util.renderToCanvas( //eslint-disable-line
          gpgpu, renderShader, inferenceResult.getTexture());

      new VR(canvas.toDataURL());

      showBackbutton();
    });
  };

  const showBackbutton = () => {

    backBtn.classList.remove(`hide`);

    backBtn.addEventListener(`click`, showBegin);

  };

  const showBegin = () => {
    aboutText.classList.remove(`hide`);
    aboutBtnStart.classList.remove(`hide`);
    logoAnim.classList.remove(`logo-reversefade`);
    backBtn.classList.add(`hide`);
    document.body.removeChild(document.querySelector(`.vr`));
  };


  const setCanvasShape = shape => {
    canvas.width = shape[1];
    canvas.height = shape[0];
    if (shape[1] > shape[0]) {
      canvas.style.width = `500px`;
      canvas.style.height = `${(shape[0] / shape[1] * 500).toString()  }px`;
    } else {
      canvas.style.height = `500px`;
      canvas.style.width = `${(shape[1] / shape[0] * 500).toString()  }px`;
    }
  };
};



init();

import 'babel-polyfill'; //eslint-disable-line

import {Array3D, GPGPUContext, gpgpu_util, render_ndarray_gpu_util, NDArrayMathCPU, NDArrayMathGPU} from 'deeplearn'; //eslint-disable-line
import TransformNet from './net';
import VR from './vr';

const STYLE_MAPPINGS = {
  'Udnie, Francis Picabia': `udnie`,
  'The Scream, Edvard Munch': `scream`,
  'La Muse, Pablo Picasso': `la_muse`,
  'Rain Princess, Leonid Afremov': `rain_princess`,
  'The Wave, Katsushika Hokusai': `wave`,
  'The Wreck of the Minotaur, J.M.W. Turner': `wreck`
};
const STYLE_NAMES = Object.keys(STYLE_MAPPINGS);

const init = () => {
  const canvas = document.querySelector(`.imageCanvas`);
  const gl = gpgpu_util.createWebGLContext(canvas); //eslint-disable-line
  const gpgpu = new GPGPUContext(gl);
  const math = new NDArrayMathGPU(gpgpu);
  const mathCPU = new NDArrayMathCPU(); //eslint-disable-line

  const contentImgElement = document.querySelector(`.contentImg`);
  const styleImgElement = document.querySelector(`.styleImg`);

  contentImgElement.src = `../assets/img/stata.jpg`;
  contentImgElement.height = 250;

  let selectedStyleName = STYLE_MAPPINGS[`Udnie, Francis Picabia`];
  styleImgElement.src = `../assets/img/udnie.jpg`;
  styleImgElement.height = 250;

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

  const styleDropdown = document.querySelector(`.style-dropdown`);
  for (let i = 0;i < STYLE_NAMES.length;i ++) {
    const option = document.createElement(`option`);
    option.value = STYLE_NAMES[i];
    option.label = STYLE_NAMES[i];
    styleDropdown.appendChild(option);
  }

  const fileSelectButton = document.querySelector(`.file-upload`);
  fileSelectButton.addEventListener(`click`, () => {
    fileSelect.click();
  });

  styleDropdown.addEventListener(`change`, e => {
    const selectedDropdown = e.currentTarget.value;
    selectedStyleName = STYLE_MAPPINGS[selectedDropdown];
    styleImgElement.src = `../assets/img/${selectedStyleName}.jpg`;
  });

  const startButton = document.querySelector(`.start`);
  startButton.addEventListener(`click`, () => {
    document.querySelector(`.load-error-message`).style.display = `none`;
    startButton.innerText = `Starting style transfer.. Downloading + running model`;
    startButton.disabled = true;
    transformNet.setStyle(selectedStyleName);

    transformNet.load().then(
      () => {
        startButton.innerText = `Processing image`;
        runInference();
        startButton.innerText = `Start style transfer button`;
        startButton.disabled = false;
      }
    ).catch(error => {
      console.log(error);
      startButton.innerText = `Start style transfer`;
      startButton.disabled = false;
      const errMessage = document.querySelector(`.load-error-message`);
      errMessage.innerText = error;
      errMessage.style.display = `block`;
    });
  });

  const runInference = async () => {
    await math.scope(async (keep, track) => {
      const preprocessed = track(Array3D.fromPixels(contentImgElement));

      const inferenceResult = await transformNet.predict(preprocessed);
      setCanvasShape(inferenceResult.shape);
      const renderShader = render_ndarray_gpu_util.getRenderRGBShader( //eslint-disable-line
          gpgpu, inferenceResult.shape[1]);
      render_ndarray_gpu_util.renderToCanvas( //eslint-disable-line
          gpgpu, renderShader, inferenceResult.getTexture());

      const vr = new VR(canvas.toDataURL()); //eslint-disable-line
    });
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

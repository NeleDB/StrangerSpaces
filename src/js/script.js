import 'babel-polyfill'; //eslint-disable-line

import {Array3D, GPGPUContext, gpgpu_util, render_ndarray_gpu_util, NDArrayMathCPU, NDArrayMathGPU} from 'deeplearn'; //eslint-disable-line
import TransformNet from './net';
import qrcode from 'qrcode-generator';

import cloudinary from 'cloudinary-core';

const cloudName = `dyvwrz9yg`;
const unsignedUploadPreset = `vazbjvyr`;

import VR from './classes/vr.js';
// import mobileVR from './classes/mobilevr';

import {STYLE_MAPPINGS, getRandomStyle} from './lib/transferableStyles';

const init = () => {
  if (window.location.pathname === `/client.html`) {
    mobile();
  } else {
    main();
  }
};




const mobile = () => {
  console.log(`hello client`);
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get(`id`);
  const format = urlParams.get(`format`);

  const img = document.querySelector(`.sky-img`);
  const src = `https://res.cloudinary.com/${cloudName}/image/upload/${id}.${format}`;
  console.log(src);
  img.setAttribute(`src`, src);
  // new mobileVR(src);

};

const main = () => {
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

  const selectedStyleName = getRandomStyle();

  const transformNet = new TransformNet(math, STYLE_MAPPINGS[selectedStyleName]);

  const fileSelect = document.querySelector(`.fileSelect`);
  fileSelect.addEventListener(`change`, ({target}) => {
    const file = target.files[0];
    const fileReader = new FileReader();

    const warningNode = document.querySelector(`.file-size-warning`);

    if (warningNode.innerText.length > 0) warningNode.innerText = ``;

    if (file.size > 1000000) {
      const err = `File is larger than 1MB`;
      warningNode.innerText = err;
      throw new Error(err);
    }

    fileReader.addEventListener(`load`, ({target}) => {
      contentImgElement.src = target.result;
    });

      // TODO: check readAsBinaryString, avoid limit for 1MB+ images
    fileReader.readAsDataURL(file);
    fileSelect.value = ``;

    const cl = new cloudinary.Cloudinary({cloud_name: cloudName, secure: true}); //eslint-disable-line
    console.log(cl);
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

      uploadFile(canvas.toDataURL());

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

  const uploadFile = file => {
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    xhr.open(`POST`, url, true);
    xhr.setRequestHeader(`X-Requested-With`, `XMLHttpRequest`);

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        // File uploaded successfully
        const response = JSON.parse(xhr.responseText);
        console.log(response);
        document.querySelector(`.client-link`).href = `/client.html?id=${response.public_id}&format=${response.format}`;

        const qr = qrcode(0, `M`);
        qr.addData(`192.168.0.247:3000/client.html?id=${response.public_id}&format=${response.format}`);
        qr.make();
        document.getElementById(`placeHolder`).innerHTML = qr.createImgTag();
      }
    };

    fd.append(`upload_preset`, unsignedUploadPreset);
    fd.append(`file`, file);
    xhr.send(fd);
  };
};




init();

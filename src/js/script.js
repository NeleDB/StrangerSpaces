// import {Array3D, GPGPUContext, gpgpu_util, render_ndarray_gpu_util, NDArrayMathCPU, NDArrayMathGPU} from 'deeplearn';
// import {TransformNet} from './net';
// import {PolymerElement, PolymerHTMLElement} from './polymer-spec';
import 'babel-polyfill'; //eslint-disable-line

import {Array3D, GPGPUContext, gpgpu_util, render_ndarray_gpu_util, NDArrayMathCPU, NDArrayMathGPU} from 'deeplearn'; //eslint-disable-line
import TransformNet from './net';
const IDLE = 1;
// const TRAINING = 2;

const CONTENT_NAMES = `Upload from file`;
const STYLE_MAPPINGS = {
  'Udnie, Francis Picabia': `udnie`,
  'The Scream, Edvard Munch': `scream`,
  'La Muse, Pablo Picasso': `la_muse`,
  'Rain Princess, Leonid Afremov': `rain_princess`,
  'The Wave, Katsushika Hokusai': `wave`,
  'The Wreck of the Minotaur, J.M.W. Turner': `wreck`
};
const STYLE_NAMES = Object.keys(STYLE_MAPPINGS);


// const __extends = (this && this.__extends) || (function () {
//   const extendStatics = Object.setPrototypeOf ||
//         ({__proto__: []} instanceof Array && function (d, b) { d.__proto__ = b; }) ||
//         function (d, b) { for (const p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
//   return function (d, b) {
//     extendStatics(d, b);
//     function __() { this.constructor = d; }
//     d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
//   };
// })();
// const __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
//   return new (P || (P = Promise))(function (resolve, reject) {
//     function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
//     function rejected(value) { try { step(generator[`throw`](value)); } catch (e) { reject(e); } }
//     function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
//     step((generator = generator.apply(thisArg, _arguments || [])).next());
//   });
// };
// const __generator = (this && this.__generator) || function (thisArg, body) {
//   let _ = {label: 0, sent: function() { if (t[0] & 1) throw t[1];return t[1]; }, trys: [], ops: []}, f, y, t, g;
//   return g = {next: verb(0), throw: verb(1), return: verb(2)}, typeof Symbol === `function` && (g[Symbol.iterator] = function() { return this; }), g;
//   function verb(n) { return function (v) { return step([n, v]); }; }
//   function step(op) {
//     if (f) throw new TypeError(`Generator is already executing.`);
//     while (_) try {
//       if (f = 1, y && (t = y[op[0] & 2 ? `return` : op[0] ? `throw` : `next`]) && !(t = t.call(y, op[1])).done) return t;
//       if (y = 0, t) op = [0, t.value];
//       switch (op[0]) {
//       case 0: case 1: t = op;break;
//       case 4: _.label++;return {value: op[1], done: false};
//       case 5: _.label++;y = op[1];op = [0];continue;
//       case 7: op = _.ops.pop();_.trys.pop();continue;
//       default:
//         if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0;continue; }
//         if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1];break; }
//         if (op[0] === 6 && _.label < t[1]) { _.label = t[1];t = op;break; }
//         if (t && _.label < t[2]) { _.label = t[2];_.ops.push(op);break; }
//         if (t[2]) _.ops.pop();
//         _.trys.pop();continue;
//       }
//       op = body.call(thisArg, _);
//     } catch (e) { op = [6, e];y = 0; } finally { f = t = 0; }
//     if (op[0] & 5) throw op[1];return {value: op[0] ? op[1] : void 0, done: true};
//   }
// };

const init = () => {
  const canvas = document.querySelector(`.imageCanvas`);
  const gl = gpgpu_util.createWebGLContext(canvas);//eslint-disable-line
  const gpgpu = new GPGPUContext(gl);
  const math = new NDArrayMathGPU(gpgpu);
  const mathCPU = new NDArrayMathCPU();//eslint-disable-line

  const applicationState = IDLE;//eslint-disable-line
  const status = ``;//eslint-disable-line

  const contentImgElement = document.querySelector(`.contentImg`);
  const styleImgElement = document.querySelector(`.styleImg`);

  const contentNames = CONTENT_NAMES;//eslint-disable-line
  const selectedContentName = `stata`;//eslint-disable-line
  contentImgElement.src = `../assets/img/stata.jpg`;
  contentImgElement.height = 250;

  const styleNames = STYLE_NAMES;//eslint-disable-line
  const selectedStyleName = `Udnie, Francis Picabia`;//eslint-disable-line
  styleImgElement.src = `../assets/img/udnie.jpg`;
  styleImgElement.height = 250;

  const transformNet = new TransformNet(math, STYLE_MAPPINGS[selectedStyleName]);//eslint-disable-line

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

  const fileSelectButton = document.querySelector(`.file-upload`);
  fileSelectButton.addEventListener(`click`, () => {
    fileSelect.click();
  });

  const styleDropdown = document.querySelector(`.style-dropdown`);
  styleDropdown.addEventListener(`click`, e => {
    console.log(e.currentTarget);
  });

  const startButton = document.querySelector(`.start`);
  startButton.addEventListener(`click`, () => {
    document.querySelector(`.load-error-message`).style.display = `none`;
    startButton.innerText = `Starting style transfer.. Downloading + running model`;
    startButton.disabled = true;
    transformNet.setStyle(STYLE_MAPPINGS[selectedStyleName]);
    //console.log(selectedStyleName);
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
    });
  };


  const setCanvasShape = shape => {
    console.log(shape);
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

"use strict";
const __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
    function rejected(value) { try { step(generator[`throw`](value)); } catch (e) { reject(e); } }
    function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
const __generator = (this && this.__generator) || function (thisArg, body) {
  let _ = {label: 0, sent: function() { if (t[0] & 1) throw t[1];return t[1]; }, trys: [], ops: []}, f, y, t, g;
  return g = {next: verb(0), throw: verb(1), return: verb(2)}, typeof Symbol === `function` && (g[Symbol.iterator] = function() { return this; }), g;
  function verb(n) { return function (v) { return step([n, v]); }; }
  function step(op) {
    if (f) throw new TypeError(`Generator is already executing.`);
    while (_) try {
      if (f = 1, y && (t = y[op[0] & 2 ? `return` : op[0] ? `throw` : `next`]) && !(t = t.call(y, op[1])).done) return t;
      if (y = 0, t) op = [0, t.value];
      switch (op[0]) {
      case 0: case 1: t = op;break;
      case 4: _.label++;return {value: op[1], done: false};
      case 5: _.label++;y = op[1];op = [0];continue;
      case 7: op = _.ops.pop();_.trys.pop();continue;
      default:
        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0;continue; }
        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1];break; }
        if (op[0] === 6 && _.label < t[1]) { _.label = t[1];t = op;break; }
        if (t && _.label < t[2]) { _.label = t[2];_.ops.push(op);break; }
        if (t[2]) _.ops.pop();
        _.trys.pop();continue;
      }
      op = body.call(thisArg, _);
    } catch (e) { op = [6, e];y = 0; } finally { f = t = 0; }
    if (op[0] & 5) throw op[1];return {value: op[0] ? op[1] : void 0, done: true};
  }
};
exports.__esModule = true;
const deeplearn1 = require(`deeplearn`);
const GOOGLE_CLOUD_STORAGE_DIR =
//  'https://storage.googleapis.com/learnjs-data/checkpoint_zoo/transformnet/';
`${document.URL.substr(0, document.URL.lastIndexOf(`/`))  }/js/ckpts/`;
const TransformNet = (function () {
  function TransformNet(math, style) {
    this.math = math;
    this.style = style;
    this.variableDictionary = {};
    this.timesScalar = deeplearn1.Scalar[`new`](150);
    this.plusScalar = deeplearn1.Scalar[`new`](255. / 2);
    this.epsilonScalar = deeplearn1.Scalar[`new`](1e-3);
  }
  TransformNet.prototype.setStyle = function (style) {
    this.style = style;
  };
    /**
     * Loads necessary variables for SqueezeNet. Resolves the promise when the
     * variables have all been loaded.
     */
  TransformNet.prototype.load = function () {
    return __awaiter(this, void 0, void 0, function () {
      let checkpointLoader, _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
        case 0:
          if (!(this.variableDictionary[this.style] == null)) return [3 /*break*/, 2];
          checkpointLoader = new deeplearn1.CheckpointLoader(`${GOOGLE_CLOUD_STORAGE_DIR + this.style  }/`);
          _a = this.variableDictionary;
          _b = this.style;
          return [4 /*yield*/, checkpointLoader.getAllVariables()];
        case 1:
          _a[_b] =
                            _c.sent();
          _c.label = 2;
          break;
        case 2:
          this.variables = this.variableDictionary[this.style];
          return [2 /*return*/];
        }
      });
    });
  };
    /**
     * Infer through TransformNet, assumes variables have been loaded.
     * Original Tensorflow version of model can be found at
     * https://github.com/lengstrom/fast-style-transfer
     *
     * @param preprocessedInput preprocessed input Array.
     * @return Array3D containing pixels of output img
     */
  TransformNet.prototype.predict = function (preprocessedInput) {
    return __awaiter(this, void 0, void 0, function () {
      const _this = this;
      let img;
      return __generator(this, function () {
        img = this.math.scope(function () {
          const conv1 = _this.convLayer(preprocessedInput, 1, true, 0);
          const conv2 = _this.convLayer(conv1, 2, true, 3);
          const conv3 = _this.convLayer(conv2, 2, true, 6);
          const resid1 = _this.residualBlock(conv3, 9);
          const resid2 = _this.residualBlock(resid1, 15);
          const resid3 = _this.residualBlock(resid2, 21);
          const resid4 = _this.residualBlock(resid3, 27);
          const resid5 = _this.residualBlock(resid4, 33);
          const convT1 = _this.convTransposeLayer(resid5, 64, 2, 39);
          const convT2 = _this.convTransposeLayer(convT1, 32, 2, 42);
          const convT3 = _this.convLayer(convT2, 1, false, 45);
          const outTanh = _this.math.tanh(convT3);
          const scaled = _this.math.scalarTimesArray(_this.timesScalar, outTanh);
          const shifted = _this.math.scalarPlusArray(_this.plusScalar, scaled);
          const clamped = _this.math.clip(shifted, 0, 255);
          const normalized = _this.math.divide(clamped, deeplearn1.Scalar[`new`](255.));
          return normalized;
        });
        return [2 /*return*/, img];
      });
    });
  };
  TransformNet.prototype.convLayer = function (input, strides, relu, varId) {
    const y = this.math.conv2d(input, this.variables[this.varName(varId)], null, [strides, strides], `same`);
    const y2 = this.instanceNorm(y, varId + 1);
    if (relu) {
      return this.math.relu(y2);
    }
    return y2;
  };
  TransformNet.prototype.convTransposeLayer = function (input, numFilters, strides, varId) {
    const a = input.shape, height = a[0], width = a[1];
    const newRows = height * strides;
    const newCols = width * strides;
    const newShape = [newRows, newCols, numFilters];
    const y = this.math.conv2dTranspose(input, this.variables[this.varName(varId)], newShape, [strides, strides], `same`);
    const y2 = this.instanceNorm(y, varId + 1);
    const y3 = this.math.relu(y2);
    return y3;
  };
  TransformNet.prototype.residualBlock = function (input, varId) {
    const conv1 = this.convLayer(input, 1, true, varId);
    const conv2 = this.convLayer(conv1, 1, false, varId + 3);
    return this.math.addStrict(conv2, input);
  };
  TransformNet.prototype.instanceNorm = function (input, varId) {
    const a = input.shape, height = a[0], width = a[1], inDepth = a[2];
    const moments = this.math.moments(input, [0, 1]);
    const mu = moments.mean;
    const sigmaSq = moments.variance;
    const shift = this.variables[this.varName(varId)];
    const scale = this.variables[this.varName(varId + 1)];
    const epsilon = this.epsilonScalar;
    const normalized = this.math.divide(this.math.sub(input, mu), this.math.sqrt(this.math.add(sigmaSq, epsilon)));
    const shifted = this.math.add(this.math.multiply(scale, normalized), shift);
    return shifted.as3D(height, width, inDepth);
  };
  TransformNet.prototype.varName = function (varId) {
    if (varId === 0) {
      return `Variable`;
    }
    else {
      return `Variable_${  varId.toString()}`;
    }
  };
  TransformNet.prototype.dispose = function () {
    for (const styleName in this.variableDictionary) {
      for (const varName in this.variableDictionary[styleName]) {
        this.variableDictionary[styleName][varName].dispose();
      }
    }
  };
  return TransformNet;
}());
exports.TransformNet = TransformNet;

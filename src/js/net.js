import {Scalar, CheckpointLoader, Array1D, Array3D, Array4D, NDArray, NDArrayMathGPU} from 'deeplearn'; //eslint-disable-line

const GOOGLE_CLOUD_STORAGE_DIR = `${document.URL.substr(0, document.URL.lastIndexOf(`/`))  }/assets/ckpts/`;

export default class TransformNet {
  constructor(math, style) {
    this.math = math;
    this.style = style;
    this.variableDictionary = {};
    this.variables = {}; //eslint-disable-line
    this.timesScalar = Scalar.new(150);
    this.plusScalar = Scalar.new(255. / 2);
    this.epsilonScalar = Scalar.new(1e-3);
  }

  setStyle(style) {
    this.style = style;
  }

  async load() {
    if (this.variableDictionary[this.style] == null) {
      const checkpointLoader = new CheckpointLoader(`${GOOGLE_CLOUD_STORAGE_DIR + this.style  }/`);
      this.variableDictionary[this.style] = await checkpointLoader.getAllVariables();
    }
    this.variables = this.variableDictionary[this.style];
  }

  async predict(preprocessedInput) {
    const img = this.math.scope((keep, track) => { //eslint-disable-line
      const conv1 = this.convLayer(preprocessedInput, 1, true, 0);
      const conv2 = this.convLayer(conv1, 2, true, 3);
      const conv3 = this.convLayer(conv2, 2, true, 6);
      const resid1 = this.residualBlock(conv3, 9);
      const resid2 = this.residualBlock(resid1, 15);
      const resid3 = this.residualBlock(resid2, 21);
      const resid4 = this.residualBlock(resid3, 27);
      const resid5 = this.residualBlock(resid4, 33);
      const convT1 = this.convTransposeLayer(resid5, 64, 2, 39);
      const convT2 = this.convTransposeLayer(convT1, 32, 2, 42);
      const convT3 = this.convLayer(convT2, 1, false, 45);
      const outTanh = this.math.tanh(convT3);
      const scaled = this.math.scalarTimesArray(this.timesScalar, outTanh);
      const shifted = this.math.scalarPlusArray(this.plusScalar, scaled);
      const clamped = this.math.clip(shifted, 0, 255);
      const normalized = this.math.divide(clamped, Scalar.new(255.));
      return normalized;
    });
    return img;
  }

  convLayer(input, strides, relu, varId) {
    const y = this.math.conv2d(input, this.variables[this.varName(varId)], null, [strides, strides], `same`);
    const y2 = this.instanceNorm(y, varId + 1);
    if (relu) {
      return this.math.relu(y2);
    }
    return y2;
  }

  convTransposeLayer(input, numFilters, strides, varId) {
    console.log(input);
    const a = input.shape, height = a[0], width = a[1];
    const newRows = height * strides;
    const newCols = width * strides;
    const newShape = [newRows, newCols, numFilters];
    const y = this.math.conv2dTranspose(input, this.variables[this.varName(varId)], newShape, [strides, strides], `same`);
    const y2 = this.instanceNorm(y, varId + 1);
    const y3 = this.math.relu(y2);
    return y3;
  }

  residualBlock(input, varId) {
    const conv1 = this.convLayer(input, 1, true, varId);
    const conv2 = this.convLayer(conv1, 1, false, varId + 3);
    return this.math.addStrict(conv2, input);
  }

  instanceNorm(input, varId) {
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
  }

  varName(varId) {
    if (varId === 0) {
      return `Variable`;
    }
    else {
      return `Variable_${  varId.toString()}`;
    }
  }

  dispose() {
    for (const styleName in this.variableDictionary) {
      for (const varName in this.variableDictionary[styleName]) {
        this.variableDictionary[styleName][varName].dispose();
      }
    }
  }
}

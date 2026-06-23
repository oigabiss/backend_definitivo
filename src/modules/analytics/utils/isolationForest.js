/**
 * Isolation Forest implementation in pure JavaScript
 */

class IsolationTree {
  constructor(heightLimit) {
    this.heightLimit = heightLimit;
    this.root = null;
  }

  build(data, currentHeight = 0) {
    if (data.length <= 1 || currentHeight >= this.heightLimit) {
      return {
        type: 'leaf',
        size: data.length,
        height: currentHeight,
      };
    }

    const numFeatures = data[0].length;
    const featureIndex = Math.floor(Math.random() * numFeatures);
    
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < data.length; i++) {
      const val = data[i][featureIndex];
      if (val < min) min = val;
      if (val > max) max = val;
    }

    if (min === max) {
      return {
        type: 'leaf',
        size: data.length,
        height: currentHeight,
      };
    }

    const splitValue = min + Math.random() * (max - min);

    const leftData = [];
    const rightData = [];

    for (let i = 0; i < data.length; i++) {
      if (data[i][featureIndex] < splitValue) {
        leftData.push(data[i]);
      } else {
        rightData.push(data[i]);
      }
    }

    return {
      type: 'internal',
      featureIndex,
      splitValue,
      left: this.build(leftData, currentHeight + 1),
      right: this.build(rightData, currentHeight + 1),
    };
  }

  pathLength(point, node = this.root, currentHeight = 0) {
    if (node.type === 'leaf') {
      return currentHeight + this.c(node.size);
    }

    if (point[node.featureIndex] < node.splitValue) {
      return this.pathLength(point, node.left, currentHeight + 1);
    } else {
      return this.pathLength(point, node.right, currentHeight + 1);
    }
  }

  c(n) {
    if (n <= 1) return 0;
    if (n === 2) return 1;
    return 2 * (Math.log(n - 1) + 0.5772156649) - (2 * (n - 1) / n);
  }
}

class IsolationForest {
  constructor(options = {}) {
    this.numTrees = options.numTrees || 100;
    this.sampleSize = options.sampleSize || 256;
    this.trees = [];
  }

  fit(data) {
    this.trees = [];
    const actualSampleSize = Math.min(this.sampleSize, data.length);
    const heightLimit = Math.ceil(Math.log2(actualSampleSize));

    for (let i = 0; i < this.numTrees; i++) {
      const sample = [];
      const dataCopy = [...data];
      for (let j = 0; j < actualSampleSize; j++) {
        const randomIndex = Math.floor(Math.random() * dataCopy.length);
        sample.push(dataCopy.splice(randomIndex, 1)[0]);
      }

      const tree = new IsolationTree(heightLimit);
      tree.root = tree.build(sample);
      this.trees.push(tree);
    }
  }

  predict(point) {
    if (this.trees.length === 0) return 0;

    let totalPathLength = 0;
    for (const tree of this.trees) {
      totalPathLength += tree.pathLength(point);
    }

    const averagePathLength = totalPathLength / this.numTrees;
    const sampleSizeC = this.trees[0].c(this.sampleSize);
    
    return Math.pow(2, -(averagePathLength / sampleSizeC));
  }

  predictBatch(data) {
    return data.map(point => this.predict(point));
  }
}

module.exports = { IsolationForest };

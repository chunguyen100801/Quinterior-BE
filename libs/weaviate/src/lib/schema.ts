export const room = {
  class: 'Room',
  vectorizer: 'img2vec-neural',
  vectorIndexType: 'hnsw',
  moduleConfig: {
    'img2vec-neural': {
      imageFields: ['image'],
    },
  },
  properties: [
    {
      name: 'roomPrompt',
      dataType: ['RoomPrompt'],
    },
    {
      name: 'image',
      dataType: ['blob'],
    },
    {
      name: 'image_url',
      dataType: ['string'],
    },
    {
      name: 'workspaceId',
      dataType: ['int'],
    },
    {
      name: 'seed',
      dataType: ['number'],
    },
    {
      name: 'numInferenceSteps',
      dataType: ['int'],
    },
    {
      name: 'guidanceScale',
      dataType: ['number'],
    },
    {
      name: 'negativePrompt',
      dataType: ['string'],
    },
  ],
};

export const roomPrompt = {
  class: 'RoomPrompt',
  vectorizer: 'text2vec-transformers',
  vectorIndexType: 'hnsw',
  moduleConfig: {
    'text2vec-transformers': {
      textFields: ['prompt'],
    },
  },
  properties: [
    {
      name: 'prompt',
      dataType: ['string'],
    },
  ],
};

export const interior = {
  class: 'Interior',
  vectorIndexType: 'hnsw',
  properties: [
    {
      name: 'interiorImages',
      dataType: ['InteriorImage'],
    },
    {
      name: 'interiorName',
      dataType: ['InteriorName'],
    },
    {
      name: 'productID',
      dataType: ['int'],
    },
    {
      name: 'model',
      dataType: ['text'],
    },
  ],
};

export const interiorImage = {
  class: 'InteriorImage',
  vectorizer: 'img2vec-neural',
  vectorIndexType: 'hnsw',
  moduleConfig: {
    'img2vec-neural': {
      imageFields: ['image'],
    },
  },
  properties: [
    {
      name: 'image',
      dataType: ['blob'],
    },
    {
      name: 'image_url',
      dataType: ['string'],
    },
  ],
};

export const interiorName = {
  class: 'InteriorName',
  vectorizer: 'text2vec-transformers',
  vectorIndexType: 'hnsw',
  properties: [
    {
      name: 'name',
      dataType: ['string'],
    },
  ],
};

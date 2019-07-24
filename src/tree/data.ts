import { TreeNodeData } from './types';
const data:TreeNodeData={
  name: "Tututuru",
  id:1,
  isExpanded: true,
  children: [
    {
      name: "Aaaaaaaaaaaa ahhahahahah",
      isExpanded: true,
      id:2,

      children: [
        { name: "A1",id:3 },
        { name: "A2",id:4 },
        { name: "A3", id:5 },
        {
          name: "C",
          id:6,
          children: [
            {
              name: "C1",
              id:7
            },
            {
              name: "D",
              id:8,
              children: [
                {
                  name: "D111",
                  id:9
                },
                {
                  name: "D2",
                  id:10
                },
                {
                  name: "D3333333",
                  id:11
                }
              ]
            }
          ]
        }
      ]
    },
    { name: "Z", id:12 },
    {
      name: "Bbbbbbbbb",
      id:13,
      children: [{ name: "B1", id:14 }, { name: "B26", id:15 }, { name: "B3",id:16 }]
    }
  ]
};

export default data;
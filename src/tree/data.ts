import { TreeNodeData } from './types';
const data:TreeNodeData={
  name: "Tututuru",
  isExpanded: true,
  children: [
    {
      name: "Aaaaaaaaaaaa ahhahahahah",
      isExpanded: true,

      children: [
        { name: "A1" },
        { name: "A2" },
        { name: "A3" },
        {
          name: "C",
          children: [
            {
              name: "C1"
            },
            {
              name: "D",
              children: [
                {
                  name: "D111"
                },
                {
                  name: "D2"
                },
                {
                  name: "D3333333"
                }
              ]
            }
          ]
        }
      ]
    },
    { name: "Z" },
    {
      name: "Bbbbbbbbb",
      children: [{ name: "B1" }, { name: "B26" }, { name: "B3" }]
    }
  ]
};

export default {name:"Test"};
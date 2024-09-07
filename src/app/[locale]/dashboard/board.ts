const barData = [
    { name: '融雪盐', value: 138, washaway: 0.21014492753623193 },
    { name: '草包', value: 109, washaway: 0.5596330275229358 },
    { name: '麻袋', value: 48, washaway: 0 },
  ];

const barLineData = [
    { time: '10:00', call: 4, orders: 12, people: 2 },
    { time: '11:00', call: 2, orders: 6, people: 3 },
    { time: '12:00', call: 13, orders: 12, people: 5 },
    { time: '13:00', call: 9, orders: 9, people: 3 },
    { time: '14:00', call: 5, orders: 12, people: 3 },
    { time: '16:00', call: 8, orders: 12, people: 4 },
    { time: '17:00', call: 13, orders: 10, people: 2 },
  ];

  const pieData = [
    { item: '融雪盐', count: 400, percent: 0.4 },
    { item: '扫把', count: 210, percent: 0.21 },
    { item: '麻袋', count: 170, percent: 0.17 },
  ];

  const choData = [
    {
      source: '北京',
      target: '天津',
      value: 30,
    },
    {
      source: '北京',
      target: '上海',
      value: 80,
    },
    {
      source: '北京',
      target: '河北',
      value: 46,
    },
    {
      source: '北京',
      target: '辽宁',
      value: 49,
    },
    {
      source: '北京',
      target: '黑龙江',
      value: 69,
    },
    {
      source: '北京',
      target: '吉林',
      value: 19,
    },
    {
      source: '天津',
      target: '河北',
      value: 62,
    },
    {
      source: '天津',
      target: '辽宁',
      value: 82,
    },
    {
      source: '天津',
      target: '上海',
      value: 16,
    },
    {
      source: '上海',
      target: '黑龙江',
      value: 16,
    },
    {
      source: '河北',
      target: '黑龙江',
      value: 76,
    },
    {
      source: '河北',
      target: '内蒙古',
      value: 24,
    },
    {
      source: '内蒙古',
      target: '北京',
      value: 32,
    },
  ];


const boardList = [
    {
        id: '1',
        w: 'calc(30% - 16px)',
        h: 320,
        type: 'bar',
        data: barData
    },
    {
        id: '3',
        w: 'calc(34% - 16px)',
        h: 320,
        type: 'pie',
        data: pieData,
        title:'仓库总库存情况'
    },
    {
        id: '5',
        w: 'calc(36% - 16px)',
        h: 320,
        type: 'chord',
        data: choData
    },

    {
        id: '6',
        w: 'calc(42% - 16px)',
        h: 320,
        type: 'path',
        data: {
            type: 'fetch',
            value: 'https://assets.antv.antgroup.com/g2/lastfm.json',
            transform: [
            {
                type: 'venn',
                padding: 8,
                sets: 'sets',
                size: 'size',
                as: ['key', 'path'],
            },
            ],
        }
    },
    {
        id: '2',
        w: 'calc(58% - 16px)',
        h: 320,
        type: 'barline',
        data: barLineData
    },
]

export default boardList
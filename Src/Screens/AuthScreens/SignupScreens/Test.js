let Topics = [
  {
    topicId: 1,
    topic: 'Login',
    status: 'pending',
  },
  {
    topicId: 2,
    topic: 'Signup',
    status: 'completed',
  },
  {
    topicId: 3,
    topic: 'Profile',
    status: 'completed',
  },
  {
    topicId: 4,
    topic: 'Dashboard',
    status: 'pending',
  },
];
let tasks = [
  {taskId: 1, topicId: 4, name: 'Design', status: 'completed'},
  {taskId: 2, topicId: 3, name: 'Responsive', status: 'completed'},
  {taskId: 3, topicId: 1, name: 'Design', status: 'completed'},
  {taskId: 4, topicId: 2, name: 'Design', status: 'completed'},
  {taskId: 5, topicId: 4, name: 'Responsive', status: 'pending'},
  {taskId: 6, topicId: 1, name: 'API Integration', status: 'pending'},
  {taskId: 7, topicId: 3, name: 'API Integration', status: 'completed'},
  {taskId: 8, topicId: 1, name: 'Responsive', status: 'completed'},
  {taskId: 9, topicId: 2, name: 'API Integration', status: 'completed'},
  {taskId: 10, topicId: 4, name: 'API Integration', status: 'pending'},
  {taskId: 11, topicId: 3, name: 'Design', status: 'completed'},
  {taskId: 12, topicId: 2, name: 'Responsive', status: 'completed'},
];

//1. calling function:  getTasksByStatus()
// output: [{
//     topic:"Login",
//     pendingTasks:[{taskId:6, name: "API Integration"}]
//     completedTasks:[{taskId:3, name:"Design"}]
// }]

let obj = {
  name: 'abc',
  age: 18,
  department: 'CSE',
  phoneNumber: '9988776655',
  address: 'abc',
};

// const a ={
//   keys:["name","age","department","phoneNumber","address"],
//   values:["abc",18,"CSE","9988776655","abc"]
// }

// [
//   {
//     key:"name",
//     value:"abc"
//   },
//   {
//     key:"age",
//     value:18
//   },
//   {
//     key:"department",
//     value:"CSE"
//   },
//   {
//     key:"phoneNumber",
//     value:"9988776655"
//   },
//   {
//     key:"address",
//     value:"abc"
//   }
// ]

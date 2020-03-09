const amqp = require('amqplib/callback_api');
const axios = require('axios');

const serverAddr = "http://localhost:3000/";

amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    var queue = 'status_que';

    channel.assertQueue(queue, {
      durable: true
    });
    channel.prefetch(1);
    console.log("Worker Running for Status Queue..");
    channel.consume(queue, function(msg) {
      let id = msg.content.toString();

      var url = serverAddr+"tickets/"+id;
      console.log(url);
      axios.get(serverAddr+"tickets/"+id).then( (res) => {
        let obj = JSON.parse(res.data[0].data);
        axios.put(serverAddr+"ticket",{"data":obj.data, "id": id, "assignee" : obj.assignee, "status": 2}).then( (res) => {
          console.log("Ticket Closed");
          channel.ack(msg);
        });
      });
    }, {
      noAck: false
    });
  });
});
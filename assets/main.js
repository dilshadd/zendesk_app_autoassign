$(function () {
  var client = ZAFClient.init();
  client.invoke('resize', { width: '100%', height: '50px' });

  try {
    
    client.context().then(function(context) {
      var ticketId = context.ticketId;
      client.get('currentUser').then(function (data) {
        var user = data.currentUser;
        var userRole = user.role;
        if (userRole == 'agent') {
          client.get('ticket.assignee.user').then(function (data) {
            var assignee = data['ticket.assignee.user']
            if(assignee){
              if(assignee.id != user.id){
                updateAssignee(client, ticketId, user, assignee.name)
              }else{
                message(`Ticket is already assigned to ${user.name}`)
              }
            }else{
              updateAssignee(client, ticketId, user, "Unassigned")
            }
          });

        }else{
          message(`Ticket not assigned to the user because user role is ${userRole}`)
        }
      });
    }); 
  }
  catch (err) {
    message(err); return true;
  }
});

function updateAssignee(client, ticketId, user, assignee) {

  var data = {
    "ticket":{  
      "assignee_id":user.id
    }
  }
  var option = {
    url:`/api/v2/tickets/${ticketId}.json`,
    type:'PUT',
    data:JSON.stringify(data),
    headers: {
        'Content-type': 'application/json'
    },
  };

  client.request(option).then(
    function(response) {
      message(`Ticket successfully assigned to ${user.name} from ${assignee}`)
    },
    function(response) {
      client.invoke('notify', 'Ticket assignment failed!');
      message(response)
    }
  );
}


function message(text) {
  var func_status = {
    'Message': `Message: ${text}.<br>`
  };
  var source = $("#assign-template").html();
  var template = Handlebars.compile(source);
  var html = template(func_status);
  $("#content").html(html);
}
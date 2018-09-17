let status = false;

setInterval(() => {
  status = !status;
  digitalWrite(NodeMCU.D4, status);
}, 1000);

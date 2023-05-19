var options = {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
};
function getTimestamp() {
  var currentDate = new Date();
  var formattedTimestamp = currentDate.toLocaleString("en-US", options);
  return formattedTimestamp;
}

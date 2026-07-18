// utility.js
function debounce(func, wait) {
  var timeout;
  return function() {
    clearTimeout(timeout);
    timeout = setTimeout(func, wait);
  };
}

function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

export { debounce, formatDate };
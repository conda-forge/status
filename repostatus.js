function statusImageNotFound (_this) {
  var s = document.createElement('span')
  s.innerHTML = 'No Status Available'
  _this.parentNode.parentNode.appendChild(s)
  _this.parentNode.parentNode.removeChild(_this.parentNode)
}

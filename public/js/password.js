$(function(){
  let password = "\u0000\u0000\u0000\u0000\u0016\u001f\f+\u001a\u001a\u001d$\u00183"

  const pass = "thisismypassword"
  // console.log(password);
  let encod = encode(pass)
  let decod = decode(password)
  alert(decod)
  $("#pass").html(encod)

  
})




const key = "GN\\\\Lqnw-xc]=jQ}fTyN[Y|x5Db-FET?&)T\#{f@6qK3q>C?[9z.1u.o0;+-Hf^7^MfRBmvAJ@zZu:-aQeAr.$h0u2y{iy/5<0A`)KZQ8vcP'vVm3DS@{_{y.i"

function transform(string) {
  let result = ''

  for (let i = 0; i < Math.min(string.length, key.length); i++) {
    result += String.fromCharCode(string.charCodeAt(i) ^ key.charCodeAt(i))
  }

  return result
}

function encode(string) {
  return string.substr(0, 4) !== '\0\0\0\0'
    ? '\0\0\0\0' + transform(string)
    : string
}

function decode(string) {
  return string.substr(0, 4) === '\0\0\0\0'
    ? transform(string.substr(4))
    : string
}


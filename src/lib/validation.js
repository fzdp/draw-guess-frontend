function testEmail(email_val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_val);
}

function testRoomPassword(val) {
  return /^[0-9A-Za-z]{4,12}$/.test(val);
}

function testUsername(val) {
  return /^[0-9A-Za-z_]{2,15}$/.test(val);
}

function testName(val) {
  return /^[a-zA-Z0-9_\u4e00-\u9fa5]{2,15}$/.test(val);
}

export {testEmail, testRoomPassword, testUsername, testName};

export class DeviceSNInvalid extends Error {
  constructor() {
    super('Serial Number must have exactly 12 numeric digits');
    this.name = 'DeviceSNInvalid';
  }
}

export class DeviceSNAlreadyExists extends Error {
  constructor() {
    super('Device with this Serial Number already exists');
    this.name = 'DeviceSNAlreadyExists';
  }
}

export class UserAlreadyExists extends Error {
  constructor() {
    super('User with this email already exists');
    this.name = 'UserAlreadyExists';
  }
}
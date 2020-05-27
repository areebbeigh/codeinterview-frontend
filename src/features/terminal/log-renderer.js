import chalk from 'chalk';
import moment from 'moment';

const ENTRY_TYPES = {
  USER_JOIN: 'UJ',
  USER_LEAVE: 'UL',
  USER_MSG: 'UM',
  USER_RUN: 'UR',
  USER_JOIN_CALL: 'UJC',
  USER_LEAVE_CALL: 'ULC',
  CODE_OUTPUT: 'CO',
};

class LogRenderer {
  constructor({ showTimestamps, profiles }) {
    this.chalk = new chalk.Instance({ level: 3 });
    this.showTimestamps = showTimestamps;
    this.profiles = profiles;
  }

  colorAuthor(username) {
    const profiles = this.profiles.filter(
      profile => profile.username === username
    );
    if (profiles.length === 0) return this.chalk`{dim ${username}}`;
    return this.chalk`{hex('${profiles[0].color}') ${username}}`;
  }

  withTimestamp({ timestamp, line }) {
    if (this.showTimestamps) {
      const ts = this.chalk`{dim ${moment
        .unix(timestamp)
        .format('hh:mm')}}`;
      return this.chalk`${ts} ${line}`;
    }
    return line;
  }

  render({ timestamp, content, type, author }) {
    const rv = [];

    const add = line => {
      rv.push(this.withTimestamp({ timestamp, line }));
    };

    switch (type) {
      case ENTRY_TYPES.USER_JOIN:
        add(
          this.chalk`{italic.hex('#b2b7bb') {bold ${this.colorAuthor(
            author
          )}} joined the room}`
        );
        break;
      case ENTRY_TYPES.USER_LEAVE:
        add(
          this.chalk`{italic.hex('#b2b7bb') {bold ${this.colorAuthor(
            author
          )}} left the room}`
        );
        break;
      case ENTRY_TYPES.USER_RUN:
        add(
          this.chalk`{italic.white.bold ${this.colorAuthor(
            author
          )} made a run request}`
        );
        break;
      case ENTRY_TYPES.USER_MSG:
        add(
          this.chalk`{bold ${this.colorAuthor(author)}}: ${content}`
        );
        break;
      case ENTRY_TYPES.USER_JOIN_CALL:
        add(
          this.chalk`{italic.white.bold ${this.colorAuthor(
            author
          )} joined the video call}`
        );
        break;
      case ENTRY_TYPES.USER_LEAVE_CALL:
        add(
          this.chalk`{italic.white.bold ${this.colorAuthor(
            author
          )} left the video call}`
        );
        break;
      case ENTRY_TYPES.CODE_OUTPUT:
        rv.push(this.chalk`{dim.italic Code output:}`);
        if (content.error) {
          content.error
            .trim()
            .split('\n')
            .map(line => this.chalk`{bold.red ${line}}`)
            .map(add);
        }
        if (content.output) {
          content.output
            .trim()
            .split('\n')
            .map(line => this.chalk`{bgBlack ${line}}`)
            .map(add);
          add(
            this
              .chalk`{italic.dim Execution time: ${content.exec_time}s}`
          );
        }
        break;
      default:
        content.split('\n').map(add);
    }
    return rv;
  }
}

export default LogRenderer;

import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { action } from '@ember/object'
import io from 'socket.io-client'

export default class MessagesListComponent extends Component {
  @tracked messages = [
    {
      userName: 'bot',
      text: 'Hello',
    },
  ]

  @tracked userName
  @tracked inputText = ''

  constructor(...args) {
    super(...args)

    this.socket = io('http://localhost:3000')

    const userName = localStorage.getItem('userName')

    this.socket.on('nameIsBusy', () => {
      alert('This name is busy')

      this.initUserName()
    })

    this.socket.on('userInitialized', (userName) => {
      this.userName = userName

      localStorage.setItem('userName', userName)
    })

    this.socket.on('newMessage', this.update)

    if (!userName) {
      this.initUserName()
    } else {
      this.socket.emit('initUser', userName)
    }
  }

  initUserName() {
    const userName = prompt('Enter User name')

    if (!userName) {
      return this.initUserName()
    }

    this.socket.emit('initUser', userName)
  }

  @action onInputChange(e) {
    this.inputText = e.target.value
  }

  @action onSendMessage() {
    this.socket.emit('newMessage', {
      userName: this.userName,
      text: this.inputText,
    })

    this.inputText = ''
  }

  @action update(msg) {
    this.messages = [...this.messages, msg]
  }
}

export default class NotificationMessage {
  element;
  static activeNotification;

  constructor(message, {duration = 2000, type = 'success'} = {}){
    this.message = message;
    this.duration = duration;
    this.type = type;

    if (NotificationMessage.activeNotification) {
     NotificationMessage.activeNotification.remove();
    }

    this.render();
  }

  get template(){
    return `
      <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>`;
  }

  render(){
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    NotificationMessage.activeNotification = this.element;
  }

  show(target){
    (target || document.body).append(this.element);
    setTimeout( () => this.remove(), this.duration);
    return this.element;
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    NotificationMessage.activeNotification = null;
  }

}

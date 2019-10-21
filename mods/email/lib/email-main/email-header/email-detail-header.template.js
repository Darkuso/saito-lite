module.exports = EmailDetailHeaderTempkate = (title) => {
  return `
    <div class="email-detail-left-options">
      <i id="email-form-back-button" class="icon-med fas fa-arrow-left"></i>
      <h3>${title}</h3>
    </div>
    <div class="email-detail-right-options">
    <div class="email-icons">
      <i id="email-delete-icon" class="icon-med far fa-trash-alt"></i>
      <i id="email-detail-reply" class="icon-med fas fa-reply"></i>
      <i id="email-detail-forward" class="icon-med fas fa-share"></i>
    </div>
    <div class="email-balance">${("0.0000000").replace(/0+$/,'').replace(/\.$/,'\.0')} Saito</div>
    </div>
  `;
}
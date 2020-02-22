module.exports = ForumPostTemplate = (tx) => {

  let link = tx.transaction.msg.link;
  let domain = tx.transaction.domain || "";
  let subforum = "/forum/main";
  let post_id = tx.transaction.msg.post_id || tx.transaction.sig;
  let comments_text = "read comments";
  let votes = tx.transaction.votes || 0;
  let comments = tx.transaction.comments || 0;
  if (comments > 0) {
    if (comments == 1) {
      comments_text = "1 comment";
    } else {
      comments_text = comments + " comments";
    }
  }
  let thumbnail = "/forum/img/forum-logo.png";

  if (tx.transaction.msg.forum) { subforum = "/forum/"+tx.transaction.msg.forum; }
  if (link == "") { link = subforum+"/"+tx.transaction.sig; }
  let discussion_link = subforum + "/" + tx.transaction.sig;

  let html = `
      <div class="post" id="${tx.transaction.sig}">
        <div class="teaser-votes">
          <div class="post-upvote upvote-wrapper" id="${tx.transaction.sig}" >
            <i class="fa fa-arrow-up upvote post_upvote" aria-hidden="true"></i>
          </div>
          <div class="votes-total">${tx.transaction.votes}</div>
          <div class="post-downvote downvote-wrapper" id="${tx.transaction.sig}" >
            <i class="fa fa-arrow-down downvote post_downvote" aria-hidden="true"></i>
          </div>
        </div>

        <div class="teaser-thumbnail"><img src="${thumbnail}" class="teaser-thumbnail-image" /></div>

        <div class="teaser-content">
          <div class="teaser-content-title"><a href="${link}">${tx.transaction.msg.title}</a>
  `;
   if (domain != "") {
     html += `<div class="teaser-site">(<a href="${link}">${domain}</a>)</div>`;
   }
   html += `
        </div>

        <div class="teaser-content-details">submitted by <span class="post_author_clickable" id="post_author_clickable_${tx.transaction.sig}">david</span> to <a href="${subforum}">${subforum}</a><span class="post_author_address" id="${tx.transaction.from[0].add}" style="display:none"></span></div>
      </div>

      <div class="post-content">
This is where our post content goes
This is where our post content goes
This is where our post content goes
This is where our post content goes
This is where our post content goes
This is where our post content goes
This is where our post content goes
This is where our post content goes
This is where our post content goes
This is where our post content goes
This is where our post content goes
This is where our post content goes
This is where our post content goes
This is where our post content goes
This is where our post content goes
This is where our post content goes
This is where our post content goes
This is where our post content goes

      </div>

      <div class="post-add-comment" id="post-add-comment">
	<textarea class="post-add-comment-textarea" id="post-add-comment-textarea"></textarea>
	<button class="post-add-comment-btn">comment</button>

	<input type="hidden" class="post-parent-id" id="post-parent-id" value="${tx.transaction.sig}" />
	<input type="hidden" class="post-post-id" id="post-post-id" value="${post_id}" />
	<input type="hidden" class="post-forum" id="post-forum" value="${tx.transaction.msg.forum}" />

      </div>

  `;

  return html;
}

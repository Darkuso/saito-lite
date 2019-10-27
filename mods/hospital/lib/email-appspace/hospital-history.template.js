module.exports = HospitalHistoryTemplate = () => {
  return `

        <h2>Clinical Survey</h2>

        <div class="row">
          <label for="current_medication">Are you currently taking any medication?</label>
        </div>

        <div class="row">
          <input type="radio" name="current_medication" value="yes" onclick="$('#current_medication_details_div').show();" /> yes
        </div>
        <div class="row">
          <input type="radio" name="current_medication" value="no" /> no
        </div>

        <div style="display:none" class="row" id="current_medication_details_div">
          <label for="current_medication">Please provide details:</label>
          <textarea name="current_medication_details" class="details_textarea"></textarea>
        </div>

        <div class="row" style="margin-top:20px;">
          <div class="col-25"></div>
          <div class="col-50">
            <button class="button" id="confirm">Confirm</button>
          </div>
          <div class="col-25"></div>
        </div>

<style>
body {
    font-family: arial, helvetica, sans-serif;
    font-size: 13px;
    padding:0px;
    margin:0px;
***REMOVED***

h1 {
    margin: 0em;
***REMOVED***

.details_textarea {
  border: 1px solid black;
  padding:2px;
  width: 100%;
  height: 200px;

***REMOVED***

.row {
    display: -ms-flexbox; /* IE10 */
    display: flex;
    -ms-flex-wrap: wrap; /* IE10 */
    flex-wrap: wrap;
***REMOVED***

.col-2 {
    -ms-flex: 2%; /* IE10 */
    flex: 2%;
***REMOVED***

.col-5 {
    -ms-flex: 5%; /* IE10 */
    flex: 5%;
***REMOVED***

.col-10 {
    -ms-flex: 10%; /* IE10 */
    flex: 10%;
***REMOVED***

.col-15 {
    -ms-flex: 15%; /* IE10 */
    flex: 15%;
***REMOVED***

.col-20 {
    -ms-flex: 20%; /* IE10 */
    flex: 20%;
***REMOVED***

.col-25 {
    -ms-flex: 25%; /* IE10 */
    flex: 25%;
***REMOVED***

.col-28 {
    -ms-flex: 28%; /* IE10 */
    flex: 28%;
***REMOVED***

.col-33 {
    -ms-flex: 33%; /* IE10 */
    flex: 33%;
***REMOVED***

.col-40 {
    -ms-flex: 40%; /* IE10 */
    flex: 40%;
***REMOVED***

.col-46 {
    -ms-flex: 46%; /* IE10 */
    flex: 46%;
***REMOVED***

.col-50 {
    -ms-flex: 50%; /* IE10 */
    flex: 50%;
***REMOVED***

.col-58 {
    -ms-flex: 58%; /* IE10 */
    flex: 58%;
***REMOVED***

.col-60 {
    -ms-flex: 60%; /* IE10 */
    flex: 60%;
***REMOVED***

.col-75 {
    -ms-flex: 75%; /* IE10 */
    flex: 75%;
***REMOVED***

.col-80 {
    -ms-flex: 80%; /* IE10 */
    flex: 80%;
***REMOVED***

.col-100 {
    -ms-flex: 100%; /* IE10 */
    flex: 100%;
***REMOVED***

.splash {

***REMOVED***

.splash_image_container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 1em;
***REMOVED***

.splash_image {
    width: 30%;
    height: auto;
***REMOVED***

.splash_buttons_container {
    text-align:center;
    padding: 1em;
***REMOVED***

.container {
    padding: 1rem;
    display: grid;
    grid-gap: 0.5em;
***REMOVED***

.appointment {
    display: grid;
    grid-gap: 0.75em;
    margin: auto;
    /* max-width: 30vw; */
    width: 50vw;
***REMOVED***

select {
    height: 2.5em;
    width: 100%;
    border: 1px solid lightgrey;
***REMOVED***


.input_dob {
    display: flex;
***REMOVED***

.label {
    margin-bottom: 0.5em;
***REMOVED***


input[type=text], input[type=number] {
    width: 100%;
    font-size: 1em;
    padding: 0.3em;
    border: 1px solid lightgrey;
    border-radius: 3px;
***REMOVED***

textarea {
    width: 100%;
    height: 10vw;
***REMOVED***


.button {
    border: none;
    background: #404040;
    color: #ffffff !important;
    font-weight: 100;
    padding: 20px;
    text-transform: uppercase;
    border-radius: 6px;
    transition: all 0.3s ease 0s;
***REMOVED***

#confirm {
    width: 100%;
***REMOVED***

</style>

  `;
***REMOVED***

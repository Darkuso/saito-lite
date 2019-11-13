if (typeof window !== "undefined") {
    //document.body.addEventListener('DOMSubtreeModified', treatFiles, true);

    var mutationObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
    ***REMOVED***console.log(mutation);
            findFileInputs(mutation.addedNodes);
    ***REMOVED***);
***REMOVED***);

    mutationObserver.observe(document.documentElement, {
        attributes: true,
        characterData: true,
        childList: true,
        subtree: true,
        attributeOldValue: true
***REMOVED***);

    window.salert = function (message) {
        var wrapper = document.createElement('div');
        wrapper.id = 'alert-wrapper';
        var html = '<div id="alert-shim">';
        html += '<div id="alert-box">';
        html += '<p class="alert-message">' + message + '</p>'
        html += '<div id="alert-buttons"><button id="alert-ok">OK</button>'
        html += '</div></div>';
        wrapper.innerHTML = html;
        document.body.appendChild(wrapper);
        setTimeout(() => {
            document.querySelector('#alert-box').style.top = "0";
    ***REMOVED***, 100);
        document.querySelector('#alert-ok').addEventListener("click", function () {
            wrapper.remove();
    ***REMOVED***, false);
***REMOVED***;

    window.sconfirm = function (message) {
        return new Promise((resolve, reject) => {
            var wrapper = document.createElement('div');
            wrapper.id = 'alert-wrapper';
            var html = '<div id="alert-shim">';
            html += '<div id="alert-box">';
            html += '<p class="alert-message">' + message + '</p>'
            html += '<div id="alert-buttons"><button id="alert-cancel">Cancel</button><div id="alert-buttons"><button id="alert-ok">OK</button>'
            html += '</div></div>';
            wrapper.innerHTML = html;
            document.body.appendChild(wrapper);
            setTimeout(() => {
                document.querySelector('#alert-box').style.top = "0";
        ***REMOVED***, 100);
            document.querySelector('#alert-ok').addEventListener("click", function () {
                wrapper.remove();
                resolve(true);
        ***REMOVED***, false);
            document.querySelector('#alert-cancel').addEventListener("click", function () {
                wrapper.remove();
                resolve(false);
        ***REMOVED***, false);
    ***REMOVED***);
***REMOVED***;

    function findFileInputs(nodeList) {
        for (var i = 0; i < nodeList.length; i++) {
            if (nodeList[i].files) {
                treatFiles(nodeList[i]);
        ***REMOVED***
            if (nodeList[i].childNodes.length >= 1) {
                findFileInputs(nodeList[i].childNodes);
        ***REMOVED***
    ***REMOVED***
***REMOVED***

    function treatFiles(input) {
        console.log(input);
        if (input.classList.contains('treated')) {
            return;
    ***REMOVED*** else {
            input.addEventListener('change', function (e) {
                var fileName = '';
                if (this.files && this.files.length > 1) {
                    fileName = this.files.length + ' files selected.';
            ***REMOVED*** else {
                    fileName = e.target.value.split("\\").pop();
            ***REMOVED***
                if (fileName) {
                    filelabel.style.border = "none";
                    filelabel.innerHTML = fileName;
            ***REMOVED*** else {
                    filelabel.innerHTML = labelVal;
            ***REMOVED***
        ***REMOVED***);
            input.classList.add('treated');
            var filelabel = document.createElement('label');
            filelabel.classList.add('treated');
            filelabel.innerHTML = "Choose File";
            filelabel.htmlFor = input.id;
            filelabel.id = input.id + "-label";
            var parent = input.parentNode;
            parent.appendChild(filelabel);
    ***REMOVED***
***REMOVED***;

***REMOVED***;
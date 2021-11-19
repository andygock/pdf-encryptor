if (module.hot) {
  module.hot.accept();
}

// https://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string
const _arrayBufferToBase64 = (buffer) => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// force browser download dialog
// https://stackoverflow.com/questions/3665115/how-to-create-a-file-in-memory-for-user-to-download-but-not-through-server
const downloadPDF = (filename, arrayBuffer) => {
  const base64 = _arrayBufferToBase64(arrayBuffer);
  const element = document.createElement("a");
  element.setAttribute("href", "data:application/pdf;base64," + base64);
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

const form = document.getElementById("file");
form.addEventListener(
  "change",
  (ev) => {
    if (
      !window.File ||
      !window.FileReader ||
      !window.FileList ||
      !window.Blob
    ) {
      alert("The File APIs are not fully supported in this browser.");
      return;
    }

    // get user password
    const password = document.getElementById("password").value;

    // default output filename if error occurs, however output should be "Encrypted original.pdf"
    let uploadFilename = "output.pdf";

    // https://www.javascripture.com/FileReader

    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      const array = new Uint8Array(arrayBuffer);

      // https://github.com/j3k0/qpdf.js
      QPDF.encrypt({
        logger: (text) => {
          // console.log(text);
        },
        arrayBuffer: array,
        userPassword: password,
        ownerPassword: password,
        callback: (err, arrayBuffer) => {
          if (err) {
            alert(err.message);
          } else if (arrayBuffer === null) {
            alert("Unknown error occured");
          } else {
            downloadPDF(`Encrypted ${uploadFilename}`, arrayBuffer);
          }
        },
      });
    };

    if (ev.target.files.length !== 1) {
      // user uploaded too many files
      alert("More than one file was selected. Please select one file only.");
    } else if (ev.target.files[0].type === "application/pdf") {
      uploadFilename = ev.target.files[0].name;
      reader.readAsArrayBuffer(ev.target.files[0]);
    } else {
      alert("Selected file does not appear to be a PDF");
    }
  },
  false
);

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

const handleFileInput = (ev) => {
  if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
    alert("The File APIs are not fully supported in this browser.");
    return;
  }

  // get user password
  const password = document.getElementById("password").value;

  if (password.length === 0) {
    alert("Password missing");
    return;
  }

  // default output filename if error occurs, however output should be "Encrypted original.pdf"
  let uploadFilename = "output.pdf";

  // https://www.javascripture.com/FileReader
  const reader = new FileReader();
  reader.onload = async (e) => {
    const arrayBuffer = e.target.result;
    const array = new Uint8Array(arrayBuffer);

    message.innerText = "Processing now. Please wait...";

    try {
      const encryptedArrayBuffer = await encryptPDF(array, password);

      // processing complete
      message.innerText = "";

      // give user a download dialog
      downloadPDF(`Encrypted ${uploadFilename}`, encryptedArrayBuffer);
    } catch (err) {
      message.innerText = "Error occured.";
      alert(err);
      return;
    }
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
};

// https://github.com/j3k0/qpdf.js
const encryptPDF = (inputArrayBuffer, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error("Timeout exceeded"));
    }, 10000);

    QPDF.encrypt({
      logger: (text) => {
        // console.log(text);
      },
      arrayBuffer: inputArrayBuffer,
      userPassword: password,
      ownerPassword: password,
      callback: (err, arrayBuffer) => {
        // note: there isn't a way to cancel the processing
        if (err) {
          reject(err);
        } else if (arrayBuffer === null) {
          reject(new Error("Unknown error occured"));
        } else {
          resolve(arrayBuffer);
        }
      },
    });
  });
};

//
// SCRIPT STARTS HERE
//

const message = document.getElementById("message");
const form = document.getElementById("file");

if (module.hot) {
  module.hot.dispose(() => {
    form.removeEventListener("change", handleFileInput);
  });
  module.hot.accept();
}

form.addEventListener("change", handleFileInput, false);

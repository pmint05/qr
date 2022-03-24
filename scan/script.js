const $ = (selector) => document.querySelector(selector),
	$$ = (selector) => document.querySelectorAll(selector),
	app = $("#app"),
	form = $("form"),
	urlInput = $("#urlInput"),
	fileInput = $("#fileInput"),
	imageContainer = $("#imageContainer"),
	previewImage = $("#imageContainer img"),
	fileName = $("#fileName"),
	closePreviewBtn = $("#closePreviewBtn"),
	scanBtn = $("#scanBtn"),
	hiddenFileInput = $("#hiddenFileInput"),
	pasteBtn = $("#pasteBtn"),
	resultWrapper = $("#result"),
	resultText = $("#finalResult"),
	origin = $("#origin"),
	overlay = $("#overlay"),
	closeResultBtn = $("#closeResultBtn"),
	copyResultBtn = $("#copyResultBtn");
pasteBtn.onclick = async () => {
	if (navigator.clipboard) {
		urlInput.value = await navigator.clipboard.readText();
	} else {
		alert("Clipboard API not supported");
	}
};
urlInput.oninput = () => {
	resetPreview();
};
form.onsubmit = (e) => {
	e.preventDefault();
	let url = urlInput.value.trim();
	let file;
	if (url) {
		var expression =
			/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
		var regex = new RegExp(expression);
		if (url.match(regex)) {
			scanBtn.disabled = true;
			scan(url);
		} else {
			alert("Invalid URL");
		}
	} else {
		file = hiddenFileInput.files[0];
		if (file) {
			scanBtn.disabled = true;
			scan(file);
		}
	}
	if (!url && !file) {
		alert("No URL or file selected");
	}
};
imageContainer.onclick = (e) => {
	if (e.target.id != "closePreviewBtn") {
		hiddenFileInput.click();
		hiddenFileInput.onchange = (e) => {
			let file = e.target.files[0];
			if (file) {
				urlInput.value = "";
				if (file.name.length > 20) {
					fileName.innerText =
						file.name.slice(0, 20) +
						"..." +
						file.name.split(".")[1];
				} else {
					fileName.innerText = file.name;
				}
				fileInput.classList.add("active");
				previewImage.src = URL.createObjectURL(file);
			}
		};
	}
};
closePreviewBtn.onclick = () => {
	resetPreview();
};
closeResultBtn.onclick = () => {
	resultWrapper.classList.remove("show");
	overlay.classList.remove("show");
	resultText.innerText = "";
	origin.innerText = "";
};
copyResultBtn.onclick = () => {
	navigator.clipboard.writeText(resultText.innerText);
	alert("Copied to clipboard");
};
let scan = async (url) => {
	form.classList.add("scanning");
	if (typeof url == "string") {
		await fetch(
			`https://api.qrserver.com/v1/read-qr-code/?fileurl=${encodeURIComponent(
				url
			)}`
		)
			.then((res) => res.json())
			.then((data) => showData(data, url));
	} else {
		let formData = new FormData();
		formData.append("file", url);

		await fetch(`https://api.qrserver.com/v1/read-qr-code/?file=${url}`, {
			"Content-Type": "multipart/form-data",
			method: "POST",
			body: formData,
		})
			.then((res) => res.json())
			.then((data) => showData(data, url));
	}
	form.classList.remove("scanning");
	scanBtn.disabled = false;
	urlInput.value = "";
	resetPreview();
};
let resetPreview = () => {
	previewImage.src = "";
	fileName.innerText = "Upload file here!";
	fileInput.classList.remove("active");
	hiddenFileInput.value = "";
};
let showData = (data, url) => {
	let dataText = data.length > 0 ? data[0].symbol[0].data : "";
	let dataError = data.length > 0 ? data[0].symbol[0].error : "";
	if (typeof url == "string") {
		origin.innerText = `Url: ${url}`;
	} else {
		let fileName;
		if (url.name.length > 30) {
			fileName = url.name.slice(0, 30) + "..." + url.name.split(".")[1];
		} else {
			fileName = file.name;
		}
		origin.innerText = `File: ${fileName}`;
	}
	if (dataText) {
		$("#status").innerText = "Success";
		if (dataText.indexOf("http") != -1) {
			let html = linkify(dataText);
			resultText.innerHTML = html;
		} else {
			resultText.innerText = dataText;
		}
	} else {
		$("#status").innerText = "Error";
		resultText.innerText = dataError;
	}
	resultWrapper.classList.add("show");
	overlay.classList.add("show");
};
function linkify(text) {
	var urlRegex =
		/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
	return text.replace(urlRegex, function (url) {
		return '<a href="' + url + '" target="_blank" >' + url + "</a>";
	});
}

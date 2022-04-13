const $ = (selector) => document.querySelector(selector),
	$$ = (selector) => document.querySelectorAll(selector),
	app = $("#app"),
	qrForm = $("#qrForm"),
	qrInput = $("#contentInput"),
	generateBtn = $("#generateBtn"),
	qrList = $("#qrList"),
	sizeInput = $("#sizeInput"),
	marginInput = $("#marginInput"),
	colorInput = $("#colorInput"),
	bgColorInput = $("#bgColorInput"),
	formatInput = $("#formatInput"),
	pasteBtn = $("#pasteBtn"),
	colorRefreshBtn = $(".refreshBtn.color"),
	bgColorRefreshBtn = $(".refreshBtn.bgColor"),
	swapColorBtn = $("#swapColorBtn");
let localQr = JSON.parse(localStorage.getItem("qrList")) || [];
const createItem = (imgSrc, content, sizeValue, format) => {
	let item = document.createElement("div");
	item.classList.add("qrItem");
	let qrItemContainer = document.createElement("div");
	qrItemContainer.classList.add("qrImgContainer");
	qrItemContainer.innerHTML = '<div class="circle-loading"></div>';
	item.appendChild(qrItemContainer);
	let span = document.createElement("span");
	span.classList.add("qrOrigin");
	span.innerText = content;
	let qrSize = document.createElement("span");
	qrSize.classList.add("size");
	let size = sizeValue || 250;
	qrSize.innerText = `${size}x${size}`;
	let img = document.createElement("img");
	img.src = imgSrc;
	qrItemContainer.appendChild(img);
	let downloadBtn = document.createElement("ion-icon");
	let deleteBtn = document.createElement("ion-icon");
	deleteBtn.classList.add("deleteBtn");
	deleteBtn.setAttribute("name", "trash-outline");
	downloadBtn.classList.add("downloadBtn");
	downloadBtn.setAttribute("name", "cloud-download-outline");
	let btnsContainer = document.createElement("div");
	btnsContainer.classList.add("btnsContainer");
	btnsContainer.appendChild(downloadBtn);
	btnsContainer.appendChild(deleteBtn);
	downloadBtn.onclick = () => {
		downloadImage(imgSrc, content, format);
	};
	deleteBtn.onclick = () => {
		deleteQrItem(item, imgSrc);
	};
	img.onload = () => {
		setTimeout(() => {
			item.appendChild(span);
			qrItemContainer.appendChild(btnsContainer);
			qrItemContainer.appendChild(qrSize);
			qrItemContainer.removeChild(qrItemContainer.firstChild);
			img.style.opacity = 1;
			qrForm.classList.remove("loading");
		}, 500);
	};
	return item;
};
if (localQr.length > 0) {
	app.classList.add("active");
	localQr.forEach((item) => {
		let data = item.split("?")[1].split("&");
		let content = data[1].split("=")[1];
		let sizeValue =
			data[0].split("=")[1] == "x" ? "250" : data[0].split("=")[1];
		let format = data[5].split("=")[1];
		let qrItem = createItem(item, content, sizeValue, format);
		qrList.appendChild(qrItem);
	});
}
formatInput.onchange = () => {
	let format = formatInput.value;
	if (format === "svg" || format === "eps") {
		marginInput.disabled = true;
		sizeInput.setAttribute("max", "1000000");
	} else {
		marginInput.disabled = false;
		sizeInput.setAttribute("max", "1000");
	}
};
colorRefreshBtn.onclick = () => {
	colorInput.value = randomColor();
	colorInput.dispatchEvent(new Event("input"));
};
bgColorRefreshBtn.onclick = () => {
	bgColorInput.value = randomColor();
	bgColorInput.dispatchEvent(new Event("input"));
};
pasteBtn.onclick = async () => {
	if (navigator.clipboard) {
		qrInput.value = await navigator.clipboard.readText();
	} else {
		alert("Clipboard API not supported");
	}
};
qrInput.oninput = () => {
	let content = qrInput.value;
	pasteBtn.style.display = content == "" ? "block" : "none";
};
qrForm.onsubmit = (e) => {
	e.preventDefault();
	let sizeValue = sizeInput.value,
		margin = marginInput.value,
		color = colorInput.value.split("#")[1],
		bgColor = bgColorInput.value.split("#")[1],
		format = formatInput.value,
		content = qrInput.value;

	if (content.trim()) {
		console.log(sizeValue, margin, color, bgColor, format, content);
	} else {
		alert("Please enter URL or Text in the input box.");
	}
	if (content) {
		qrForm.classList.add("loading");
		app.classList.add("active");
		let imgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=${sizeValue}x${sizeValue}&data=${content}&margin=${margin}&color=${color}&bgcolor=${bgColor}&format=${format}`;
		if (format == "eps") {
			window.open(imgSrc, "_blank");
			qrForm.classList.remove("loading");
			app.classList.remove("active");
		}
		addQrItem(imgSrc, content, sizeValue, format);
		qrInput.value = "";
	}
};
const addQrItem = (imgSrc, content, sizeValue, format) => {
	let qrItem = createItem(imgSrc, content, sizeValue, format);
	qrList.appendChild(qrItem);
	localQr.push(imgSrc);
	localStorage.setItem("qrList", JSON.stringify(localQr));
};

const randomColor = () =>
	`#${Math.random().toString(16).slice(2, 8).padEnd(6, "0")}`;
async function downloadImage(imageSrc, name, format) {
	const image = await fetch(imageSrc);
	const imageBlog = await image.blob();
	const imageURL = URL.createObjectURL(imageBlog);

	const link = document.createElement("a");
	link.href = imageURL;
	link.download = `${name}.${format}`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

const deleteQrItem = (item, imgSrc) => {
	item.remove();
	let qrItem = qrList.querySelectorAll(".qrItem");
	if (qrItem.length == 0) {
		app.classList.remove("active");
	}
	let index = localQr.indexOf(imgSrc);
	localQr.splice(index, 1);
	localStorage.setItem("qrList", JSON.stringify(localQr));
};
swapColorBtn.onclick = () => {
	let color = colorInput.value;
	let bgColor = bgColorInput.value;
	colorInput.value = bgColor;
	colorInput.dispatchEvent(new Event("input"));
	bgColorInput.value = color;
	bgColorInput.dispatchEvent(new Event("input"));
};
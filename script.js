const storage = document.querySelector("#storage");
const transfer = document.querySelector("#transfer");
const bunnyRadio = document.getElementsByName("bunny_radio");
const scalewayRadio = document.getElementsByName("scaleway_radio");

const graphValueSpan = document.querySelectorAll(".graph_value");
const storageSpan = document.querySelector(".storage_value");
const transferSpan = document.querySelector(".transfer_value");

const rangeGraph = document.querySelectorAll(".graph_range");

//  price
const price = {
  backblaze: {
    storage: 0.005,
    transfer: 0.01,
    min: 7,
  },
  bunny: {
    storage: { HDD: 0.01, SSD: 0.02 },
    transfer: 0.01,
    max: 10,
  },
  scaleway: {
    storage: { multi: 0.06, single: 0.03 },
    transfer: 0.02,
    free: 75,
  },
  vultr: {
    storage: 0.01,
    transfer: 0.01,
    min: 5,
  },
};

//  value input range
let valueStorage = 0;
let valueTransfer = 0;

storage.addEventListener("input", (e) => checkValues(e));
transfer.addEventListener("input", (e) => checkValues(e));

function checkValues(event) {
  let eventId = event.target.id;

  switch (eventId) {
    case "storage":
      valueStorage = event.target.value;
      storageSpan.innerHTML = `Storage: ${valueStorage}`;
      break;
    case "transfer":
      valueTransfer = event.target.value;
      transferSpan.innerHTML = `Transfer: ${valueTransfer}`;
      break;
  }
  calc();
}

// value radio inpu
let bunnyRadioValue = "HDD";
bunnyRadio.forEach((input) => {
  input.addEventListener("input", (e) => {
    bunnyRadioValue = e.target.id;
    calc();
  });
});
let scalewayRadioValue = "multi";
scalewayRadio.forEach((input) => {
  input.addEventListener("input", (e) => {
    scalewayRadioValue = e.target.id;
    calc();
  });
});

// calc

function get_calc_price(name) {
  // get storage value based on radio
  let storage =
    typeof price[name].storage === "object"
      ? price[name].storage[eval(name + "RadioValue")]
      : price[name].storage;

  return valueStorage * storage + valueTransfer * price[name].transfer;
}

function calc() {
  let calcValue = {
    backblaze: 0,
    bunny: 0,
    scaleway: 0,
    vultr: 0,
  };
  rangeGraph.forEach((graph) => {
    let calc_result = get_calc_price(graph.dataset.value);

    switch (graph.dataset.value) {
      case "backblaze":
        calcValue.backblaze =
          calc_result < price.backblaze.min && calc_result !== 0
            ? price.backblaze.min
            : calc_result;
        break;
      case "bunny":
        calcValue.bunny =
          calc_result > price.bunny.max && calc_result !== 0
            ? price.bunny.max
            : calc_result;
        break;
      case "scaleway":
        const calcScaleway =
          (valueStorage <= price.scaleway.free
            ? 0
            : valueStorage - price.scaleway.free) *
            price.scaleway.storage[scalewayRadioValue] +
          (valueTransfer <= price.scaleway.free
            ? 0
            : valueTransfer - price.scaleway.free) *
            price.scaleway.transfer;
        calcValue.scaleway = calcScaleway;
        break;
      case "vultr":
        calcValue.vultr =
          calc_result < price.vultr.min && calc_result !== 0
            ? price.vultr.min
            : calc_result;
        break;
    }

    const screenWidth = window.screen.width;

    let graphStyle = screenWidth > 960 ? "width" : "height";

    graph.style.width = "";
    graph.style.height = "";
    // find up %
    graph.style[graphStyle] = `${(calcValue[graph.dataset.value] / 74) * 100}%`;
  });
  graphValue(calcValue);
}

// show graph value
function graphValue(calcValue) {
  graphValueSpan.forEach((span) => {
    span.innerHTML = `${calcValue[span.dataset.value].toFixed(1)}$`;
  });
}

// change window width
window.addEventListener("resize", function () {
  calc();
});

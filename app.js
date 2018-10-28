const baseUrl = $(location).attr('hostname') === '127.0.0.1'  
? 'http://localhost:3000'
: 'https://tweb-lfdm-project.herokuapp.com';

// Fetch the data from our custom Git API
const getCountryLanguages = (country) => {
  return fetch(`${baseUrl}/request/${country}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error('Fetching went wrong - datas unreachable !');
      }
      return res.json();
    });
};

// Fetch the github colors json file
const getColors = () => {
  return fetch('data/github-colors.json')
    .then(res => res.json());
}

// Transform the data from # line of code to percentage line of code
const computePercentage = (datas) =>{
  let sum = 0;
  for (const key in datas) {
    if (datas.hasOwnProperty(key)) {
      sum  += datas[key];  
    }
  }
  for (const key in datas) {
    if (datas.hasOwnProperty(key)) {
      datas[key] = Math.round(datas[key] / sum * 100); 
    }
  }

  return datas;
}


let chart = null;
const form = $('#countries')[0];

// Update and display the chart of data
const displayChart = ({ labels, data, backgroundColor }) => {
  const ctx = $('#chart')[0].getContext('2d');
  const options = {
    type: 'doughnut',
    data: {
        labels,
        datasets: [{
            data : data,
            backgroundColor,
            borderWidth : 0,
        }],
    },
    options: {
      legend: {
        position: 'right',
        labels: {
          fontSize: 20,
        }
      },
      responsive: true,   
    },
  };

  if (!chart) {
    chart = new Chart(ctx, options);
  } else {
    chart.data.labels = options.data.labels;
    chart.data.datasets = options.data.datasets;
    chart.update();
  }
  
  
}

const updatePlaceholder = (newText) => {
  $('#placeholder').html(newText);
}

// Main function that do the black magic
const handleRequest = (country) => {
  updatePlaceholder('Now loading, please wait...');
  return Promise.all([
    getCountryLanguages(country),
    getColors() 
  ])
    .then(([languages, gitColors]) => {
      delete languages._id;
      delete languages.__v;
      delete languages.timestamp;
      const labels = Object.keys(languages);
      languages = computePercentage(languages);
      const data = labels.map(label => languages[label]);
      const backgroundColor = labels.map((label) => {
        const color = gitColors[label] ? gitColors[label].color : null;
        return color || '#000';
      });
      updatePlaceholder('');
      displayChart({ labels, data, backgroundColor });
    });
}

// Link the form button with the powerful magical function
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const country = $('#selection').val();
  handleRequest(country);
})

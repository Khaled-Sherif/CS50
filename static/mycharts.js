  const ctx = document.getElementById('myChart');
  //const ctx = $('#myChart');
var chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['To read', 'Have read', 'Reading'],
                    datasets: [{
                    label: '# of times added to shelf',
                    barThickness: 50,
                    fill: false,
                    data: [0, 0, 0],
                    borderWidth: 1,
                    borderColor : "#c79e2c",
                    backgroundColor: "rgba(199, 158, 44, 0.6)"
                    }],
                },
                options: {
                    responsive:true,
                    scales: {
                        yAxes: [{

                            ticks: {
                                beginAtZero: true,
                                max:5,
                                userCallback: function(label, index, labels) {
                                    // when the floored value is the same as the value we have a whole number
                                    if (Math.floor(label) === label) {
                                        return label;
                                    }
               
                                },
                            },
                        }],
                    },
                    "legend": {
                        "display": true,
                        "position": "right",
                        "align": "top"
                    }
                }
            });

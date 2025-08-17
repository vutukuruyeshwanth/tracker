    // Global variables
        let revenueData = [];
        let activityChart, distributionChart;
        // Revenue sharing percentages
        const revenueShares = {
            'homestay': { individual: 60, community: 40 },
            'guided-tour': { individual: 70, community: 30 },
            'food': { individual: 65, community: 35 },
            'handicraft': { individual: 80, community: 20 }
        };
        // Activity labels
        const activityLabels = {
            'homestay': 'Homestay',
            'guided-tour': 'Guided Tour',
            'food': 'Local Cuisine',
            'handicraft': 'Handicrafts'
        };
        // Navigation
        function showSection(sectionId) {
            document.querySelectorAll('.section').forEach(section => {
                section.classList.add('hidden');
            });
            document.getElementById(sectionId).classList.remove('hidden');
            
            if (sectionId === 'tracker') {
                setTimeout(() => {
                    initCharts();
                    updateDashboard();
                }, 100);
            }
        }
        // Add revenue function
        function addRevenue() {
            const activityType = document.getElementById('activityType').value;
            const amount = parseFloat(document.getElementById('revenueAmount').value);
            const beneficiary = document.getElementById('beneficiary').value.trim();
            if (!amount || amount <= 0) {
                alert('Please enter a valid amount');
                return;
            }
            if (!beneficiary) {
                alert('Please enter beneficiary name');
                return;
            }
            const shares = revenueShares[activityType];
            const individualShare = (amount * shares.individual) / 100;
            const communityShare = (amount * shares.community) / 100;
            const transaction = {
                id: Date.now(),
                date: new Date().toLocaleDateString(),
                activityType,
                amount,
                beneficiary,
                individualShare,
                communityShare
            };
            revenueData.push(transaction);
            updateDashboard();
            updateTransactionTable();
            updateCharts();
            // Clear form
            document.getElementById('revenueAmount').value = '';
            document.getElementById('beneficiary').value = '';
        }
        // Update dashboard
        function updateDashboard() {
            const totalRevenue = revenueData.reduce((sum, item) => sum + item.amount, 0);
            const totalCommunityFund = revenueData.reduce((sum, item) => sum + item.communityShare, 0);
            const totalIndividualEarnings = revenueData.reduce((sum, item) => sum + item.individualShare, 0);
            document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toLocaleString()}`;
            document.getElementById('communityFund').textContent = `₹${totalCommunityFund.toLocaleString()}`;
            document.getElementById('individualEarnings').textContent = `₹${totalIndividualEarnings.toLocaleString()}`;
        }
        // Update transaction table
        function updateTransactionTable() {
            const tableBody = document.getElementById('transactionTable');
            
            if (revenueData.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-500">No transactions yet. Add your first revenue entry above!</td></tr>';
                return;
            }
            tableBody.innerHTML = revenueData.slice(-10).reverse().map(transaction => `
                <tr class="border-b border-gray-100 hover:bg-gray-50">
                    <td class="py-3 px-4">${transaction.date}</td>
                    <td class="py-3 px-4">${activityLabels[transaction.activityType]}</td>
                    <td class="py-3 px-4 font-semibold">₹${transaction.amount.toLocaleString()}</td>
                    <td class="py-3 px-4">${transaction.beneficiary}</td>
                    <td class="py-3 px-4 text-green-600">₹${transaction.individualShare.toLocaleString()}</td>
                    <td class="py-3 px-4 text-blue-600">₹${transaction.communityShare.toLocaleString()}</td>
                </tr>
            `).join('');
        }
        // Initialize charts
        function initCharts() {
            if (activityChart) activityChart.destroy();
            if (distributionChart) distributionChart.destroy();
            // Activity Chart
            const activityCtx = document.getElementById('activityChart').getContext('2d');
            activityChart = new Chart(activityCtx, {
                type: 'doughnut',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
            // Distribution Chart
            const distributionCtx = document.getElementById('distributionChart').getContext('2d');
            distributionChart = new Chart(distributionCtx, {
                type: 'bar',
                data: {
                    labels: ['Individual Earnings', 'Community Fund'],
                    datasets: [{
                        data: [0, 0],
                        backgroundColor: ['#8B5CF6', '#3B82F6'],
                        borderRadius: 8,
                        borderSkipped: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '₹' + value.toLocaleString();
                                }
                            }
                        }
                    }
                }
            });
        }
        // Update charts
        function updateCharts() {
            if (!activityChart || !distributionChart) return;
            // Activity chart data
            const activityTotals = {};
            revenueData.forEach(item => {
                activityTotals[item.activityType] = (activityTotals[item.activityType] || 0) + item.amount;
            });
            activityChart.data.labels = Object.keys(activityTotals).map(key => activityLabels[key]);
            activityChart.data.datasets[0].data = Object.values(activityTotals);
            activityChart.update();
            // Distribution chart data
            const totalIndividual = revenueData.reduce((sum, item) => sum + item.individualShare, 0);
            const totalCommunity = revenueData.reduce((sum, item) => sum + item.communityShare, 0);
            distributionChart.data.datasets[0].data = [totalIndividual, totalCommunity];
            distributionChart.update();
        }
        // Initialize the page
        document.addEventListener('DOMContentLoaded', function() {
            showSection('home');
        });
        

(function(){function c(){var b=a.contentDocument||a.contentWindow.document;
    if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'96ffd5f9c3742e23',t:'MTc1NTMzNTgxNy4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";
        b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');
        a.height=1;a.width=1;
        a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';
        document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);
    else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);
        'loading'!==document.readyState&&(document.onreadystatechange=e,c())
           }
        }
     }
    }
)();
const os = require('os');
const path = require('path');
const { Worker } = require('worker_threads');

const userCPUCount = os.cpus().length;
const workerPath = path.resolve('factorial-worker.js');

const calculateFactorialWithWorker = (number) => {
	if (number === 0 || number === 1) return 1;

	const numbers = [];
	for (let i = 1n; i <= number; i++) numbers.push(i); // numbers = [1, 2, 3, ..., number]

	//split numbers into segments
	const segmentSize = Math.ceil(numbers.length / userCPUCount);
	const segments = [];

	for (let segmentIndex = 0; segmentIndex < userCPUCount; segmentIndex++) {
		const start = segmentIndex * segmentSize;
		const end = start + segmentSize;
		const segment = numbers.slice(start, end);
		segments.push(segment);
	}

	//create threads for each cores and pass each segment to each thread
	const promises = segments.map(
		(segment) =>
			new Promise((resolve, reject) => {
				const worker = new Worker(workerPath, { workerData: segment });

				worker.on('message', resolve);
				worker.on('error', reject);
				worker.on('exit', (code) => {
					if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
				});
			})
	);

	return Promise.all(promises).then((results) => {
		return results.reduce((acc, val) => acc * val, 1n);
	});
};

const calculatFactorial = (number) => {
	const numbers = [];

	for (let i = 1n; i <= number; i++) {
		numbers.push(i);
	}

	return numbers.reduce((acc, val) => acc * val, 1n);
};

const run = async () => {
	console.time('process');
	const inputNumber = 150000n;
	const result = await calculateFactorialWithWorker(inputNumber);
	// const result = await calculatFactorial(inputNumber);

	console.timeEnd('process');
	// console.log(result);
};

run();

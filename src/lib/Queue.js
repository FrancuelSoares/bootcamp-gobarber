import Bee from 'bee-queue';

import redisConfig from '../config/redis';

import CancellationAppointmentEmail from '../app/jobs/CancellationAppointmentEmail';

const jobs = [CancellationAppointmentEmail];

class Queue {
  constructor() {
    this.queues = {};

    this.init();
  }

  /**
   * Create a Queue for each Job
   */
  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig
        }),
        handle
      };
    });
  }

  /**
   * Add a Job to a Queue
   */
  add(queueKey, job) {
    return this.queues[queueKey].bee.createJob(job).save();
  }

  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];

      bee.on('failed', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, err) {
    console.log(`Queue ${job.queue.name}: FAILED`, err);
  }
}

export default new Queue();

import Component from '@ember/component';
import { computed } from '@ember/object';
import { run } from '@ember/runloop';
import { inject as service } from '@ember/service';
import FormMixin from 'open-event-frontend/mixins/form';
import moment from 'moment';
import { countries } from 'open-event-frontend/utils/dictionary/demography';
import { orderBy } from 'lodash';

export default Component.extend(FormMixin, {
  router: service(),

  buyer: computed('data.user', function() {
    return this.get('data.user');
  }),
  holders: computed('data.attendees', function() {
    this.get('data.attendees').forEach(attendee => {
      attendee.set('firstname', '');
      attendee.set('lastname', '');
      attendee.set('email', '');
    });
    return this.get('data.attendees');
  }),
  isPaidOrder: computed('data', function() {
    if (!this.get('data.amount')) {
      this.get('data').set('paymentMode', 'free');
      return false;
    }
    return true;
  }),
  sameAsBuyer: false,

  getRemainingTime: computed('data', function() {
    let willExpireAt = this.get('data.createdAt').add(10, 'minutes');
    this.timer(willExpireAt, this.get('data.identifier'));
  }),

  timer(willExpireAt, orderIdentifier) {
    run.later(() => {
      let currentTime = moment();
      let diff = moment.duration(willExpireAt.diff(currentTime));
      this.set('getRemainingTime', moment.utc(diff.asMilliseconds()).format('mm:ss'));
      if (diff > 0) {
        this.timer(willExpireAt, orderIdentifier);
      } else {
        this.get('data').reload();
        this.get('router').transitionTo('orders.expired', orderIdentifier);
      }
    }, 1000);
  },

  getValidationRules() {
    let firstNameValidation = {
      rules: [
        {
          type   : 'empty',
          prompt : this.get('l10n').t('Please enter your first name')
        }
      ]
    };
    let lastNameValidation = {
      rules: [
        {
          type   : 'empty',
          prompt : this.get('l10n').t('Please enter your last name')
        }
      ]
    };
    let emailValidation = {
      rules: [
        {
          type   : 'empty',
          prompt : this.get('l10n').t('Please enter your email')
        },
        {
          type   : 'email',
          prompt : this.get('l10n').t('Please enter a valid email')
        }
      ]
    };
    let validationRules = {
      inline : true,
      delay  : false,
      on     : 'blur',
      fields : {
        firstName: {
          identifier : 'first_name',
          rules      : [
            {
              type   : 'empty',
              prompt : this.get('l10n').t('Please enter your first name')
            }
          ]
        },
        lastName: {
          identifier : 'last_name',
          rules      : [
            {
              type   : 'empty',
              prompt : this.get('l10n').t('Please enter your last name')
            }
          ]
        },
        email: {
          identifier : 'email',
          rules      : [
            {
              type   : 'email',
              prompt : this.get('l10n').t('Please enter a valid email address')
            }
          ]
        },
        country: {
          identifier : 'country',
          rules      : [
            {
              type   : 'empty',
              prompt : this.get('l10n').t('Please enter your country')
            }
          ]
        },
        address: {
          identifier : 'address',
          rules      : [
            {
              type   : 'empty',
              prompt : this.get('l10n').t('Please enter your address')
            }
          ]
        },
        city: {
          identifier : 'city',
          rules      : [
            {
              type   : 'empty',
              prompt : this.get('l10n').t('Please enter your city ')
            }
          ]
        },
        state: {
          identifier : 'state',
          rules      : [
            {
              type   : 'empty',
              prompt : this.get('l10n').t('Please enter your state')
            }
          ]
        },
        zipCode: {
          identifier : 'zip_code',
          rules      : [
            {
              type   : 'empty',
              prompt : this.get('l10n').t('Please enter your zip code')
            }
          ]
        },
        payVia: {
          identifier : 'payment_mode',
          rules      : [
            {
              type   : 'checked',
              prompt : this.get('l10n').t('Please specify your choice of payment method ')
            }
          ]
        }
      }
    };
    this.holders.forEach((value, index) => {
      validationRules.fields[`first_name_${index}`] = firstNameValidation;
      validationRules.fields[`last_name_${index}`] = lastNameValidation;
      validationRules.fields[`email_${index}`] = emailValidation;
    });
    return validationRules;
  },
  countries: computed(function() {
    return orderBy(countries, 'name');
  }),

  actions: {
    submit(data) {
      this.onValid(() => {
        this.sendAction('save', data);
      });
    },
    modifyHolder(holder) {
      let buyer = this.get('buyer');
      if (this.get('sameAsBuyer')) {
        holder.set('firstname', buyer.content.firstName);
        holder.set('lastname', buyer.content.lastName);
        holder.set('email', buyer.content.email);
      } else {
        holder.set('firstname', '');
        holder.set('lastname', '');
        holder.set('email', '');
      }
    }
  }
});

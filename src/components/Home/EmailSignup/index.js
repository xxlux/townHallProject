import React, { Component } from 'react';
import { Form, Icon, Input, Button } from 'antd';
import TownHall from '../../../scripts/models/TownHall';

import '../../../vendor/scripts/bootstrap-tagsinput';
const zipcodeRegEx = /^(\d{5}-\d{4}|\d{5}|\d{9})$|^([a-zA-Z]\d[a-zA-Z] \d[a-zA-Z]\d)$/g;
const emailRegEx = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;


import './style.less';

$('#email-signup-form').on('submit', emailHandler.validateSignup);
  if (localStorage.getItem('signedUp') === 'true') {
    emailHandler.hideEmailForm();
  }

$('#open-email-form').on('click', emailHandler.openEmailForm);

emailHandler.openEmailForm = function () {
  $('#email-signup').fadeIn(750);
  $('#email-update').hide();
};

emailHandler.closeEmailForm = function () {
  $('#email-signup').fadeOut(750);
  $('#email-update').removeClass('hidden').fadeIn(750);
};

emailHandler.hideEmailForm = function () {
  $('#email-signup').hide();
  $('#email-update').removeClass('hidden').show();
};

$('#close-email').on('click', function () {
  localStorage.setItem('signedUp', true);
  emailHandler.closeEmailForm();
});

$('#close-email').on('click', function () {
  localStorage.setItem('signedUp', true);
  emailHandler.closeEmailForm();
});

emailHandler.clearDistricts = function () {
  $('#email-signup-form input[name=districts]').tagsinput('removeAll');
};
emailHandler.addDistrict = function (district) {
  $('#email-signup-form input[name=districts]').tagsinput('add', district);
};

emailHandler.setDistricts = function (districts) {
  districts.forEach(function (district) {
    emailHandler.addDistrict(district);
  });
};

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class EmailSignup extends Component {
  constructor(props) {
    super(props)
    this.submitSignup = this.submitSignup.bind(this);
    this.validateSignup = this.validateSignup.bind(this);
  }
  componentDidMount() {
    this.props.form.validateFields();
  }
  submitSignup() {
    let person = {
      'person': {
        'family_name': last.val(),
        'given_name': first.val(),
        'postal_addresses': [{ 'postal_code': zipcode }],
        'email_addresses': [{ 'address': email.val() }],
        'custom_fields': {
          'districts': districts,
          'partner': partner.prop('checked')
        }
      }
    };
    // var userID = email.val().split('').reduce(function(a, b) {
    //   a = ((a << 5) - a) + b.charCodeAt(0);
    //   return a & a;
    // }, 0);
    $.ajax({
      url: 'https://actionnetwork.org/api/v2/forms/eafd3b2a-8c6b-42da-bec8-962da91b128c/submissions',
      method: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(person),
      success: function () {
        localStorage.setItem('signedUp', true);
        emailHandler.closeEmailForm();
      },
      error: function () {
        $('#email-signup-form button').before('<span class="error">An error has occured, please try again later.</span>');
      }
    });
    return false;
  }
  validateSignup = function (e) {
    e.preventDefault();
    let first = $('#email-signup-form input[name=first]');
    let last = $('#email-signup-form input[name=last]');
    let email = $('#email-signup-form input[name=email]');
    let zipcode = $('#email-signup-form input[name=zipcode]');
    let partner = $('#email-signup-form input[name=partner]');
    let districts = $('#email-signup-form input[name=districts]').tagsinput('items');
    let errors = 0;
  
    [first, email, zipcode].forEach(function (field) {
      let name = field[0].name;
      if (field[0].value.length === 0 && !$(field[0]).hasClass('hidden')) {
        field.addClass('has-error');
        errors++;
      } else if ((name === 'email' && !emailRegEx.test(field[0].value))) {
        field.addClass('has-error');
        errors++;
      } else if (name === 'zipcode' && !zipcode.hasClass('hidden') && !zipcodeRegEx.test(field[0].value)) {
        field.addClass('has-error');
        errors++;
      } else {
        field.removeClass('has-error');
      }
    });
    if (errors !== 0) {
      return;
    }
  
    let zipClean = zipcode.val().split('-')[0];
    if (districts.length === 0) {
      TownHall.lookupZip(zipClean)
        .then(function (zipToDistricts) {
          let districts = zipToDistricts.map(function (ele) {
            return ele.abr + '-' + ele.dis;
          });
          submitSignup(first, last, zipClean, email, districts, partner);
        });
    } else {
  
      submitSignup(first, last, zipClean, email, districts, partner);
    }
  };
  render() {
    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;
    return (
      <div>
        <section className="background-light-blue email-signup--inline" id="email-signup">
          <button type="button" className="close" data-dismiss="modal" aria-label="Close" id="close-email">
            <span aria-hidden="true">&times;</span>
          </button>
          <div className="container container-fluid">
            <h1 id="email-title" className="text-center extra-large">Sign up to receive updates on local events.</h1>
            <Form id="email-signup-form">
              <div className="row">
                <div className="col-lg-8">
                  <Form.Item>
                    {getFieldDecorator('first', {
                      rules: [{ required: true, message: 'Please input your first name' }],
                    })(
                      <Input
                        prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                        placeholder="First Name"
                      />,
                    )}
                  </Form.Item>
                  {/* <div className="col-sm-6">
                    <input type="text" className="form-control input-lg" name="first" placeholder="First Name" />
                  </div> */}
                  <Form.Item>
                    {getFieldDecorator('last', {
                      rules: [{ required: true, message: 'Please input your last name' }],
                    })(
                      <Input
                        prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                        placeholder="Last Name"
                      />,
                    )}
                  </Form.Item>
                  {/* <div className="col-sm-6">
                    <input type="text" className="form-control input-lg" name="last" placeholder="Last Name" />
                  </div> */}
                  <Form.Item>
                    {getFieldDecorator('email', {
                      rules: [{ required: true, message: 'Please input your email' }],
                    })(
                      <Input
                        prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                        placeholder="Email"
                      />,
                    )}
                  </Form.Item>
                  {/* <div className="col-sm-6">
                    <input type="email" className="form-control input-lg" name="email" placeholder="Email" />
                  </div> */}
                  <Form.Item>
                    {getFieldDecorator('zipcode', {
                      rules: [{ required: true, message: 'Please input your zip code' }],
                    })(
                      <Input
                        prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                        placeholder="Zip Code"
                      />,
                    )}
                  </Form.Item>
                  {/* <div className="col-sm-6">
                    <input type="text" className="form-control input-lg" name="zipcode" placeholder="Zip Code" />
                  </div> */}
                  <Form.Item>
                    {getFieldDecorator('districts', {
                      rules: [],
                    })(
                      <Input
                        prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                        placeholder="Subscribe to districts:"
                      />,
                    )}
                  </Form.Item>
                  {/* <div className="col-sm-6 hidden" id="district-subscribe">
                    <label htmlFor="districts" className="col-sm-4">Subscribe to districts:</label>
                    <input type="text" className="form-control input-lg" name="districts" data-role="tagsinput" />
                  </div> */}
                </div>
                <div className="col-lg-4">
                  <div className="col-xs-12">
                    <Button type="submit" name="button" className="btn btn-primary btn-light-background btn-lg btn-block">Sign up</Button>
                  </div>
                </div>
              </div>
            </Form>
          </div>
        </section>
        <div id="email-update" className="hidden background-light-blue container-fluid">
          <button id="open-email-form" className="btn btn-xs">Update your email subscription</button>
        </div>
      </div>
    )
  }
};

export default EmailSignup;
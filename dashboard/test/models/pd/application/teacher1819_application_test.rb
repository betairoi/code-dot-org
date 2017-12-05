require 'test_helper'

module Pd::Application
  class Teacher1819ApplicationTest < ActiveSupport::TestCase
    test 'application guid is generated on create' do
      teacher_application = build :pd_teacher1819_application
      assert_nil teacher_application.application_guid

      teacher_application.save!
      assert_not_nil teacher_application.application_guid
    end

    test 'existing guid is preserved' do
      guid = SecureRandom.uuid
      teacher_application = create :pd_teacher1819_application, application_guid: guid
      assert_equal guid, teacher_application.application_guid

      # save again
      teacher_application.save!
      assert_equal guid, teacher_application.application_guid
    end

    test 'principal_greeting' do
      hash_with_principal_title = build :pd_teacher1819_application_hash
      hash_without_principal_title = build :pd_teacher1819_application_hash, principal_title: nil

      application_with_principal_title = build :pd_teacher1819_application, form_data_hash: hash_with_principal_title
      application_without_principal_title = build :pd_teacher1819_application, form_data_hash: hash_without_principal_title

      assert_equal 'Dr. Dumbledore', application_with_principal_title.principal_greeting
      assert_equal 'Albus Dumbledore', application_without_principal_title.principal_greeting
    end

    test 'send_decision_notification_email only sends to G3 and unmatched' do
      application = create :pd_teacher1819_application
      application.update(status: 'accepted')

      mock_mail = stub
      mock_mail.stubs(:deliver_now).returns(nil)

      Pd::Application::Teacher1819ApplicationMailer.expects(:accepted).times(2).returns(mock_mail)
      application.send_decision_notification_email

      partner = create :regional_partner
      application.update(regional_partner: partner)

      partner.update(group: 1)
      application.send_decision_notification_email

      partner.update(group: 2)
      application.send_decision_notification_email

      partner.update(group: 3)
      application.send_decision_notification_email
    end

    test 'send_decision_notification_email only sends to finalized' do
      mock_mail = stub
      mock_mail.stubs(:deliver_now).returns(nil)

      Pd::Application::Teacher1819ApplicationMailer.expects(:pending).times(0)
      Pd::Application::Teacher1819ApplicationMailer.expects(:unreviewed).times(0)
      Pd::Application::Teacher1819ApplicationMailer.expects(:withdrawn).times(0)

      Pd::Application::Teacher1819ApplicationMailer.expects(:accepted).times(1).returns(mock_mail)
      Pd::Application::Teacher1819ApplicationMailer.expects(:declined).times(1).returns(mock_mail)
      Pd::Application::Teacher1819ApplicationMailer.expects(:waitlisted).times(1).returns(mock_mail)

      application = create :pd_teacher1819_application
      Pd::Application::Teacher1819Application.statuses.values.each do |status|
        application.update(status: status)
        application.send_decision_notification_email
      end
    end
  end
end

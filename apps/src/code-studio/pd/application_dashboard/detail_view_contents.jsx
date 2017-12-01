import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import {Button, FormControl, InputGroup} from 'react-bootstrap';
import DetailViewApplicationSpecificQuestions from './detail_view_application_specific_questions';
import $ from 'jquery';
import DetailViewResponse from './detail_view_response';
import {ApplicationStatuses, ApplicationFinalStatuses} from './constants';
import {ValidScores as TeacherValidScores} from '@cdo/apps/generated/pd/teacher1819ApplicationConstants';

const styles = {
  notes: {
    height: '95px'
  },
  statusSelect: {
    marginRight: '5px'
  },
  detailViewHeader: {
    display: 'flex',
    marginLeft: 'auto'
  },
  headerWrapper: {
    display: 'flex',
    alignItems: 'baseline'
  },
  saveButton: {
    marginRight: '5px'
  }
};

class DetailViewContents extends React.Component {
  static propTypes = {
    canLock: PropTypes.bool,
    applicationId: PropTypes.string.isRequired,
    applicationData: PropTypes.shape({
      regional_partner_name: PropTypes.string,
      locked: PropTypes.bool,
      notes: PropTypes.string,
      status: PropTypes.string.isRequired,
      school_name: PropTypes.string,
      district_name: PropTypes.string,
      email: PropTypes.string,
      form_data: PropTypes.object,
      application_type: PropTypes.oneOf(['Facilitator', 'Teacher']),
      response_scores: PropTypes.object
    }),
    updateProps: PropTypes.func.isRequired,
    viewType: PropTypes.oneOf(['teacher', 'facilitator']).isRequired
  };

  state = {
    status: this.props.applicationData.status,
    locked: this.props.applicationData.locked,
    notes: this.props.applicationData.notes || "Google doc rubric completed: Y/N\nTotal points:\n(If interviewing) Interview notes completed: Y/N\nAdditional notes:",
    response_scores: this.props.applicationData.response_scores || {},
    editing: false
  };

  componentWillMount() {
    this.statuses = ApplicationStatuses[this.props.viewType];
  }

  handleCancelEditClick = () => {
    this.setState({
      editing: false,
      status: this.props.applicationData.status,
      locked: this.props.applicationData.locked,
      notes: this.props.applicationData.notes
    });
  };

  handleEditClick = () => {
    this.setState({
      editing: true
    });
  };

  handleLockClick = () => {
    this.setState({
      locked: !this.state.locked,
    });
  }

  handleStatusChange = (event) => {
    this.setState({
      status: event.target.value
    });
  };

  handleNotesChange = (event) => {
    this.setState({
      notes: event.target.value
    });
  };

  handleScoreChange = (event) => {
    this.setState({
      response_scores: {...this.state.response_score, [event.target.id]: event.target.value}
    });
  }

  handleSaveClick = () => {
    $.ajax({
      method: "PATCH",
      url: `/api/v1/pd/applications/${this.props.applicationId}`,
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(Object.assign({}, this.state, {response_scores: JSON.stringify(this.state.response_scores)}))
    }).done((applicationData) => {
      this.setState({
        editing: false
      });
      this.props.updateProps({
        status: applicationData.status,
        locked: applicationData.locked,
        notes: applicationData.notes
      });
    });
  };

  renderLockButton = () => {
    const statusIsLockable = ApplicationFinalStatuses.includes(this.state.status);
    return (
      <Button
        title={statusIsLockable && `Can only lock if status is one of ${ApplicationFinalStatuses.join(', ')}`}
        disabled={!(this.state.editing && statusIsLockable)}
        onClick={this.handleLockClick}
      >
        {this.state.locked ? "Unlock" : "Lock"}
      </Button>
    );
  };

  renderEditButtons = () => {
    if (this.state.editing) {
      return [(
        <Button
          onClick={this.handleSaveClick}
          bsStyle="primary"
          key="save"
          style={styles.saveButton}
        >
          Save
        </Button>
      ), (
        <Button onClick={this.handleCancelEditClick} key="cancel">
          Cancel
        </Button>
      )];
    } else {
      return (
        <Button onClick={this.handleEditClick}>
          Edit
        </Button>
      );
    }
  };

  renderHeader = () => {
    return (
      <div style={styles.headerWrapper}>
        <h1>
          {`${this.props.applicationData.form_data.firstName} ${this.props.applicationData.form_data.lastName}`}
        </h1>

        <div id="DetailViewHeader" style={styles.detailViewHeader}>
          <InputGroup style={{marginRight: 5}}>
            <InputGroup.Button>
              {this.props.canLock && this.renderLockButton()}
            </InputGroup.Button>
            <FormControl
              componentClass="select"
              disabled={this.state.locked || !this.state.editing}
              title={this.state.locked && "The status of this application has been locked"}
              value={this.state.status}
              onChange={this.handleStatusChange}
              style={styles.statusSelect}
            >
              {
                this.statuses.map((status, i) => (
                  <option value={status.toLowerCase()} key={i}>
                    {status}
                  </option>
                ))
              }
            </FormControl>
          </InputGroup>
          {this.renderEditButtons()}
        </div>
      </div>
    );
  };

  renderTopSection = () => {
    return (
      <div id="TopSection">
        <DetailViewResponse
          question="Email"
          answer={this.props.applicationData.email}
          layout="lineItem"
        />
        {
          this.props.applicationData.application_type === 'Teacher' ?
            (
              <DetailViewResponse
                question="Regional Partner"
                questionId="regionalPartnerName"
                answer={this.props.applicationData.regional_partner_name}
                layout="panel"
                score={this.state.response_scores['regional_partner_name']}
                possibleScores={TeacherValidScores['regionalPartnerName']}
                editing={this.state.editing}
                handleScoreChange={this.handleScoreChange}
              />
            ) : (
            <DetailViewResponse
              question="Regional Partner"
              answer={this.props.applicationData.regional_partner_name}
              layout="lineItem"
            />
            )
        }
        <DetailViewResponse
          question="School Name"
          answer={this.props.applicationData.school_name}
          layout="lineItem"
        />
        <DetailViewResponse
          question="District Name"
          answer={this.props.applicationData.district_name}
          layout="lineItem"
        />
      </div>
    );
  };

  renderQuestions = () => {
    return (
      <DetailViewApplicationSpecificQuestions
        formResponses={this.props.applicationData.form_data}
        applicationType={this.props.applicationData.application_type}
        editing={this.state.editing}
        scores={this.state.response_scores}
        handleScoreChange={this.handleScoreChange}
      />
    );
  };

  renderNotes = () => {
    return (
      <div>
        <h4>
          Notes
        </h4>
        <div className="row">
          <div className="col-md-8">
            <FormControl
              id="Notes"
              disabled={!this.state.editing}
              componentClass="textarea"
              value={this.state.notes}
              onChange={this.handleNotesChange}
              style={styles.notes}
            />
          </div>
        </div>
        <br/>
        {this.renderEditButtons()}
      </div>
    );
  };

  render() {
    return (
      <div>
        {this.renderHeader()}
        {this.renderTopSection()}
        {this.renderQuestions()}
        {this.renderNotes()}
      </div>
    );
  }
}

export default connect(state => ({
  canLock: state.permissions.lockApplication,
}))(DetailViewContents);

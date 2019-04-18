import React, {Component} from "react";
import PropTypes from "prop-types";
import {withStyles} from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import StepContent from "@material-ui/core/StepContent";
import Typography from "@material-ui/core/Typography";
import GeneralForm from "./forms/GeneralForm";
import DetailsForm from "./forms/DetailsForm";
import RelativesForm from "./forms/RelativesForm";
import Confirmation from "./forms/Confirmation";
import styles from "./styles/NewPatientStyle";
import { connect } from "react-redux"
import { createContact } from "../store/actions/contactActions"


function getSteps() {
  return ["Datos Generales", "Datos Familiares", "Detalles Adicionales", "Confirmación"];
}

class NewPatient extends Component {

  state = {
    step: 0,
    contact: {}
  };

  componentDidMount() {

  }

  handleNext = () => {
    const {step} = this.state;
    this.setState({step: step + 1})
  };

  handleBack = () => {
    const {step} = this.state;
    this.setState({step: step - 1})
  };

  handleSubmit = () => {
    const {step} = this.state;
    this.setState({step: step + 1});
    this.props.createContact(this.state.contact);
  };

  handleChange = (e) => {
    this.setState({
      contact : {...this.state.contact, [e.target.name]: e.target.value}
    })
  };

  renderSteps = (step, values) => {
    switch (step) {
      case 0:
        return (
          <GeneralForm nextStep={this.handleNext} handleChange={this.handleChange}
                       values={values}/>
        );
      case 1:
        return (
          <RelativesForm prevStep={this.handleBack} nextStep={this.handleNext}
                         handleChange={this.handleChange} values={values}/>
        );
      case 2:
        return (
          <DetailsForm prevStep={this.handleBack} nextStep={this.handleNext}
                       handleChange={this.handleChange} values={values}/>
        );
      case 3:
        return (
          <Confirmation prevStep={this.handleBack} nextStep={this.handleSubmit}
                        handleChange={this.handleChange} values={values}/>
        );
      default:
        return null;
    }
  };

  render() {
    const {classes} = this.props;
    const steps = getSteps();
    const {step, contact} = this.state;

    return (
      <Paper className={classes.paper} elevation={2} square={false}>
        <Stepper className={classes.stepper} activeStep={step} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>
                <Typography component="h1" variant="h6">
                  {label}
                </Typography>
              </StepLabel>
              <StepContent>
                {this.renderSteps(index, contact)}
              </StepContent>
            </Step>
          ))}
        </Stepper>
        {step === steps.length && (
          <div className={classes.resultContainer}>
            <Typography component="h1" variant="h5">El paciente ha sido ingresado</Typography>
          </div>
        )}
      </Paper>
    );
  }
}

NewPatient.propTypes = {
  classes: PropTypes.object,
};

const mapDispatchToProps = (dispatch) => {
  return {
    createContact: (contact) => dispatch(createContact(contact))
  }
};

export default connect(null, mapDispatchToProps) (withStyles(styles)(NewPatient));
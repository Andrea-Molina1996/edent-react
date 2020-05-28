import React, {useEffect, useState} from "react";
import {Paper} from "@material-ui/core";
import axios from 'axios/index';
import "../styles/PagesStyle.css";
import {useHistory} from "react-router-dom";
import Modal from "react-modal";

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    margin: 'auto',
    transform: 'translate(-50%, -50%)'
  }
};

const TreatmentList = (props) => {
  const [checkout, setCheckout] = useState([]);
  const [treatmentType, setTreatmentType] = useState();
  const [patient, setPatient] = useState();
  const [patientId, setPatientId] = useState();
  const [isOpen, setIsOpen] = useState();
  const [menu, setMenu] = useState([]);
  const history = useHistory();

  useEffect(() => {
    const {TreatmentProp, Patient, PatientId} = props.location;
    if (TreatmentProp !== undefined) {
      localStorage.setItem("patient", JSON.stringify(Patient));
      localStorage.setItem("treatment-type", TreatmentProp);
      localStorage.setItem("patient-uid", PatientId);
      setTreatmentType(TreatmentProp);
      setPatient(Patient);
      setPatientId(PatientId);
    } else {
      setPatient(JSON.parse(localStorage.getItem("patient")));
      setTreatmentType(localStorage.getItem("treatment-type"));
      setPatientId(localStorage.getItem("patient-uid"));
    }
  }, [])

  useEffect(() => {
    if (treatmentType) {
      getTreatmentRates(treatmentType);
    }
  }, [treatmentType])

  const getTreatmentRates = (type) => {
    axios.get("https://hrtd76yb9b.execute-api.us-east-1.amazonaws.com/api/rates?type=" + type)
      .then((res) => {
        setMenu(res.data.payload);
      })
      .catch((error) => {
        console.log(error);
      })
  }

  const addNewTreatment = (treatment) => {
    if (checkout.length < 9) {
      setCheckout([...checkout, {uid: treatment.uid, name: treatment.complete_name.trim(), price: treatment.price}]);
    }
  };

  const removeTreatment = (idx) => {
    const temp = [...checkout];
    if (temp.length > 1) {
      temp.splice(idx, 1);
      setCheckout(temp);
    } else {
      setCheckout([]);
    }
  };

  const cancelModal =
    <Modal
      isOpen={isOpen}
      style={customStyles}
      ariaHideApp={false}
      contentLabel="¿Estas seguro?">
      <h3>¿Está seguro en cancelar el tratamiento?</h3>
      <div className={"modal-container"}>
        <button className="modal-button" style={{backgroundColor: "rgb(21, 149, 189)"}}
                onClick={() => {
                  history.goBack();
                  localStorage.clear();
                  setIsOpen(false)
                }}>Aceptar
        </button>
        <button className="modal-button" style={{backgroundColor: "rgb(227,83,83)"}}
                onClick={() => {
                  setIsOpen(false)
                }}>Cancelar
        </button>
      </div>
    </Modal>


  return (
    <div className={"page-container"}>
      {cancelModal}
      <Paper className={"wide-paper"} style={{display: "flex", justifyContent: "space-between", flexWrap: "wrap"}}
             elevation={2} square={false}>
        <div>
          {patient ?
            <h2 style={{textTransform: "capitalize"}}>Nuevo Tratamiento:
              {patient.first_name + " " + patient.last_name}</h2> :
            <h2>Nuevo Tratamiento</h2>}
          <h3 style={{textTransform: "capitalize"}}>{treatmentType}</h3>
        </div>
        <div style={{width: "285px", display: "flex", justifyContent: "center"}}>
          <button className={"finish-treatment-button"} style={{margin: "auto"}}
                  onClick={() => {
                    setIsOpen(true);
                  }}>Cancelar Tratamiento
          </button>
        </div>
      </Paper>
      <div style={{display: "table-column", width: "100%", justifyContent: "center"}}>
        <TreatmentCheckout checkout={checkout} patient={patient} patient_uid={patientId} remove={removeTreatment}/>
        <TreatmentMenu treatmentMenu={menu} addNewTreatment={addNewTreatment}/>
      </div>
    </div>
  )
};

const TreatmentMenu = (props) => {
  const {treatmentMenu, addNewTreatment} = props;
  const [level, setLevel] = useState(0);
  const [display, setDisplay] = useState();
  const [clickedItem, setClickedItem] = useState();

  useEffect(() => {
    setDisplay(displayMenu(treatmentMenu, level, clickedItem));
  }, [treatmentMenu, level])


  const clickItem = (treatment) => {
    if (treatment.parent || treatment.name === "atrás") {
      let new_level = treatment.name === "atrás" ? 0 : 1;
      setLevel(new_level);
      setClickedItem(treatment)
    } else {
      addNewTreatment(treatment)
    }
  }

  return (
    <div className={"side-content"}>
      {treatmentMenu.length === 0 ? <h2>Cargando...</h2> :
        <div className={"menu-container"}>
          {
            display && display.map((treatment, index) => {
              return (
                <Paper className={"menu-button"} key={index} onClick={() => {
                  clickItem(treatment)
                }}>
                  <h2 style={{textTransform: "capitalize"}}>{treatment.name}</h2>
                  <small>{treatment.parent || treatment.price === "" ? "" : "Q" + treatment.price}</small>
                </Paper>
              )
            })
          }
        </div>
      }
    </div>
  )
}

const displayMenu = (originalMenu, currentLevel, clickedItem) => {
  if (clickedItem && clickedItem.name === "atrás") {
    clickedItem = undefined;
  }
  const displayMenu = [];
  if (currentLevel > 0) {
    displayMenu.push({
      price: "",
      uid: "0",
      name: "atrás",
      parent: false
    })
  }

  originalMenu.forEach(treatment => {
    const levels = [treatment.level1, treatment.level2]
    var index = displayMenu.findIndex(x => x.name === levels[currentLevel])
    if (index === -1) {
      if (!clickedItem || (clickedItem && clickedItem["name"] === levels[0])) {
        if (levels[currentLevel + 1] !== "" && currentLevel === 0) {
          displayMenu.push({
            price: treatment.price,
            uid: treatment.uid,
            complete_name: levels[0] + " " + levels[1],
            name: levels[currentLevel],
            parent: true,
          })
        } else {
          displayMenu.push({
            price: treatment.price,
            uid: treatment.uid,
            complete_name: levels[0] + " " + levels[1],
            name: levels[currentLevel],
            parent: false,
          })
        }
      }
    }
  })
  return displayMenu;
}

const TreatmentCheckout = (props) => {
  const {checkout, patient, remove, patient_uid} = props;
  const [isOpen, setIsOpen] = useState(false);
  const history = useHistory();

  const finishTreatment = () => {
    setIsOpen(false);
    const checkout_payload = {
      checkout: checkout,
      treatment_type: localStorage.getItem("treatment-type"),
      patient: patient,
      patient_uid: patient_uid,
    }
    console.log(JSON.stringify(checkout_payload))
    axios.post('https://219f9v9yfl.execute-api.us-east-1.amazonaws.com/api/checkout',
      JSON.stringify(checkout_payload), {headers:{'Content-Type': 'application/json'}})
      .then((response) => {
        console.log(response);
        localStorage.clear();
        history.goBack();
      })
      .catch((error) => {
        console.log(JSON.stringify(error));
      });
  }

  const getTotal = (checkoutItems) => {
    let total = 0
    checkoutItems.map((item) => {
      total += parseInt(item.price)
    })
    return total;
  }

  const checkoutTotal =
    <>
      <h3><b>Total: Q{getTotal(checkout)}</b></h3>
      <button className={"finish-treatment-button"} onClick={() => {
        setIsOpen(true)
      }}>Finalizar tratamiento
      </button>
    </>

  const checkoutModal =
    <Modal
      isOpen={isOpen}
      style={customStyles}
      ariaHideApp={false}
      contentLabel="¿Estas seguro?">
      <h3>¿Está seguro en terminar el tratamiento?</h3>
      <div className={"modal-container"}>
        <button className="modal-button" style={{backgroundColor: "rgb(21, 149, 189)"}}
                onClick={finishTreatment}>Aceptar
        </button>
        <button className="modal-button" style={{backgroundColor: "rgb(227,83,83)"}}
                onClick={() => {
                  setIsOpen(false)
                }}>Cancelar
        </button>
      </div>
    </Modal>

  return (
    <>
      {checkoutModal}
      <Paper className={"lateral-paper"} elevation={2}>
        <h3><b>Tratamientos en Progreso:</b></h3>
        {
          checkout.map((treatment, idx) =>
            <TreatmentItem key={idx} idx={idx} treatment={treatment} remove={remove}/>)
        }
        {checkout.length > 0 ? checkoutTotal : <></>}
      </Paper>
    </>
  )
}

const TreatmentItem = (props) => {
  const {idx, treatment, remove} = props;

  return (
    <div className={"treatment-item"} key={idx}>
      <p style={{textTransform: "capitalize"}}>{treatment.name + " - Q" + treatment.price}
        <button className={"remove-treatment-button"} onClick={() => {
          remove(idx)
        }}>x
        </button>
      </p>
    </div>
  )
}

export {TreatmentList};
import Collaborator from "../models/Collaborator.js";
import Project from "../models/Project.js";
import User from "../models/User.js";
import { ObjectId } from "mongodb";
import { transporter } from "../helpers/mailer.js";
import { emailCollaborate } from "../helpers/constant.js";

export const AllUsers = async (req,res)=>{
  try {
    const findInDb = await User.find({})
    return res.status(200).json(findInDb)
  } catch (error) {
    return res.status(400).json(error.message)
  }
}

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params
    const findUserDb = await User.findById(id)
    res.status(200).json(findUserDb)
  } catch (err) {
    res.status(400).json(err.message)
  }
}

export const userProjects = async (req, res)=>{
    let { id } = req.params
    let getMyProjects = await User.findById(id)
    if (getMyProjects.projects.length > 0) {
      let projets = getMyProjects.projects.map(async (m) => await Project.findById(m))
        const resPromises = await Promise.all(projets)
        return res.json(resPromises)
      } else {
        return res.status(404).send("you don't have any project")
      }
}

// Controlador para hacer agregar un colaborador a un Proyecto:
export const userCollaborations = async (req,res)=>{
  let {idProject, idUserCollaborator, linkedin, number, text, email} = req.body 
  const message = "You must complete the required fields"
  // const regExpLiteral = /http(s)?:\/\/([\w]+\.)?linkedin\.com\/in\/[A-z0-9_-]+\/?/gim
  // console.log(linkedin.match(regExpLiteral))
  
  try {
      if( idProject === idUserCollaborator ) { throw new Error( 'Eres el creador del proyecto, no puedes colaborar.')}
      if(!idProject || !idUserCollaborator || !linkedin || !number || !text || !email) { throw new Error( message ) }
      let project = await Project.findById(idProject)
      let userProject = await User.findById(project.userId)
      let userColaborator = await User.findById(idUserCollaborator)
  
      let findUsers = project.collaborators.filter((element) => element.idUser.toString() === idUserCollaborator)

      if(findUsers.length > 0) {
        throw new Error('Ya estas colaborando en este Proyecto.')
      } else {
        let pendingcolaborators = await Project.findByIdAndUpdate(idProject, { $push: { 'collaborators': { idUser: ObjectId(idUserCollaborator), status: 'pending' } } })
        let pendingUserColaborators = await User.findByIdAndUpdate(idUserCollaborator, { $push: { 'collaborations': project._id } })

        await pendingcolaborators.save()
        await pendingUserColaborators.save()

        // ENVIO DE MAIL AL CREADOR DEL PROYECTO
        const answerEmail = emailCollaborate(text, email, linkedin, number, userProject, userColaborator)
        await transporter.sendMail({
          from: '"Tienes un nuevo colaborador disponible." <losmatabugs@gmail.com>', // sender address
          to: project.emailUser, // list of receivers
          subject: `Hola ${userProject.name} tienen un nuevo colaborador.`, // Subject line
          text: `Hola ${userProject.name} tienes un nuevo colaborador disponible te enviamos adjuntos todo los datos para que puedas contactarlo.`,
          html: `${ answerEmail }`
      });
        return res.status(200).json({ message:'Collaboration sent successfully'})
      }
  } catch (error) {
    return res.status(400).json(error.message)
  }
}

export const MyCollaborations = async (req,res)=>{
  let { id } = req.body
  try {
    let getMyColaborations = await User.findById(id)
    if (getMyColaborations.collaborations.length > 0){
      let projets = getMyColaborations.collaborations.map(async m => await Project.findById(m))
      const resPromises = await Promise.all(projets)
      return res.json(resPromises)
    } else {
      return res.status(404).send("No tienes ninguna colaboración aún.")
    }
  } catch (error)  {
    return res.status(400).json(error.message)
  }
}

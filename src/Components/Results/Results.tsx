import { useState, useEffect} from 'react';
import './Results.css';
import { postNewForm, apiCall, addLogo } from '../../apiCalls';
import { Project } from '../../Types/types';
import Loader from '../Loader/Loader';
import DemoCarousel from './DemoCarousel';
import { Link, useLocation } from 'react-router-dom';
import arrow from '../../images/arrow.png'
import loadingSpinner from '../../images/loadingSpinner.gif'
import Timeline from './Timeline/Timeline';
import idea from '../../images/idea.png'
import { FormData } from '../../Types/FormPageTypes';
import React from 'react';
import logosBlur from '../../images/blur-logos.jpg';
import { fonts, logoURLs } from '../../data/data';
import logoContainer from '../../images/logos/logo-container.png';
import { techVideoLinks } from '../../data/data';

interface ResultsProps {
  allProjects?: Project[]
  currentResult: Project
  updateCurrentResult?: (result: Project) => void
  requestAllProjects: () => void
  setAppError: React.Dispatch<React.SetStateAction<Error | null>>
  formData?: FormData | null
  onSavedPage?: boolean
}

const Results = ({onSavedPage, currentResult, allProjects, formData, updateCurrentResult, requestAllProjects, setAppError}: ResultsProps) => {
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [projectToSave, setProjectToSave] = useState<Project | null>(null);
  const [logoImage, setLogoImage] = useState(currentResult.attributes.logo_url);
  const [logoFont, setLogoFont] = useState(currentResult.attributes.logo_font);
  const location = useLocation().pathname;

  const getRandomIndex = (array: string[]) => {
    return Math.floor(Math.random() * array.length)
  }

  useEffect(() => { 
    if (projectToSave) {
      const patchSaved: () => Promise<Project> = apiCall(projectToSave.attributes.user_id, `projects/${projectToSave.id}`, {
        method: 'PATCH', 
        body: JSON.stringify({saved: projectToSave.attributes.saved}),
        headers: {
          "Content-Type": "application/json"
        }
      })
      const callAPI = async () => {
        setSaveLoading(true)
        try {
          const newProject = await patchSaved()
          requestAllProjects()
          setSaveLoading(false)
        } catch (error) {
          if (error instanceof Error) setAppError(error)
          setSaveLoading(false)
        } 
      }
      callAPI()
    }
    return () => setAppError(null)
  }, [projectToSave])

  const splitDataString = (data:string) => {
    return data.split('\n')
  }

  const videos = currentResult.attributes.technologies.split(', ').map(tech => {
    return (
    <div className='individual-video' key={techVideoLinks[tech]}>
      <iframe src={techVideoLinks[tech]} allowFullScreen title="Embedded youtube trailer"/> 
    </div>)
  })

  const features =  splitDataString(currentResult.attributes.features).map(feature => {
    return (<p key={feature} className='feature underlined'>&#x2022;{feature}</p>)
  })

  const interactions = splitDataString(currentResult.attributes.interactions).map(interaction => {
    return (<p key={interaction} className='feature'>&#x2022;{interaction}</p>)
  })

  const hexCodes = splitDataString(currentResult.attributes.colors).map(color => {
    return (
      <div key={color} className='color' style={{backgroundColor: `${color}`}}>
        <p className='hex-code'>{color}</p>
      </div>)})

  const createNewProject = async() => {
    if (formData) {
      setLoading(true)
      try {
        const newResult = await postNewForm(formData)
        if (updateCurrentResult) updateCurrentResult(newResult.data)
        setLoading(false)
      } catch(error) {
        console.log(error)
        if (error instanceof Error) {
          setAppError(error)
          setLoading(false)
        }
      }
    }
  }

  const handleSave = (project: Project | null) => {
    if (project) {
      const newProject = JSON.parse(JSON.stringify(project))
      newProject.attributes.saved = !newProject.attributes.saved
      setProjectToSave(newProject)
    }
  }

  const generateLogo = () => {
    setLogoImage(logoURLs[getRandomIndex(logoURLs)]);
    setLogoFont(fonts[getRandomIndex(fonts)]);
  }

  useEffect(()=> {
    const updatedAttributes = {
      ...currentResult.attributes,
      logo_url: logoImage,
      logo_font: logoFont
    }
    if(updatedAttributes.logo_url.length) {
      addLogo(updatedAttributes, currentResult.id)
      console.log(updatedAttributes)
    }
  },[logoImage])

  return (<>
    {loading ? <Loader /> :
    <section className='results-page'>
      <h1 className='project-title'>Your Project: <span className='project-title-name'>{currentResult.attributes.name}</span></h1>
        <div className='summary-collab-container'>
          <div className='collab-buttons'>
            <div className='collab'>
              <h2>Collaborators: {currentResult.attributes.collaborators}</h2>
            </div>
              {saveLoading ? <div className='save-create-div' ><img src={loadingSpinner} alt='loading spinner' /></div>: <button className='save-create-button saving-button' onClick={() => handleSave(currentResult)} >{currentResult.attributes.saved ? 'Unfavorite Plan' : 'Add to Favorites'}</button>}
              {onSavedPage && <Link className='save-create-button save-create-link' to='/saved'><img src={arrow} alt='return to saved projets button' />Return to Favorites</Link>}
              {location === '/results' && <button className='save-create-button' onClick={createNewProject}>Create Another</button>}
              {location.includes('/history') && <Link className='save-create-button save-create-link' to='/history'><img src={arrow} alt='return to all projets button' />Return to History</Link>}
          </div>
          <div className='summary'>
            <div className='summary-header'>
              <h2>Summary</h2>
            </div>
            <div className='summary-text-container'>
              <div className='summary-text-wrapper'>
                <p className='summary-text'>{currentResult.attributes.description}</p>
              </div>
            </div>
            <img className='results-sticker' src={idea} alt='hands holding up a lightbulb' />
          </div>

        </div>
        <Timeline steps={splitDataString(currentResult.attributes.steps)} timeframe={currentResult.attributes.timeline} timeframeAmt={currentResult.attributes.timeline_int} />
      <div className='design-features-container'>
        <div className='design'>
          <div className='design-header-container'>
            <div className='design-header-background'>
              <h2 className='design-header'>Design</h2>
            </div>
          </div>
          <div className='palette-header'>
            <h2 style={{paddingLeft: '20px'}}>Color Palette</h2>
          </div>
          <div className='palette-container'>
            {hexCodes}
          </div>
        </div>
        <div className='features'>
          <div className='feat-inter-header'>
            <h3>Features</h3>
          </div>
          <div className='feat-inter-text'>
            {features}
          </div>
        </div>
      </div>
        <div className='custom-logo-container'>
          <div className='custom-logo-box'>
          <div className='design-header-container'>
            <div className='design-header-background'>
              <h2 className='design-header'>Exclusive Feature</h2>
            </div>
          </div>
            <div className='palette-header '>
              <h3 style={{paddingLeft: '20px'}}>Logo</h3>
            </div>
            {loading ?  <p>...loading </p> :
              logoImage.length?
                <div className='project-logo'>
                  <img className='logo-img-container' src={logoContainer} alt='decorative logo container' /> 
                  <img src={logoImage} className='logo-image' alt='generated logo for project' />
                  <p style={{textShadow: `0px 2px 5px ${splitDataString(currentResult.attributes.colors)[getRandomIndex(splitDataString(currentResult.attributes.colors))]}`, fontFamily: logoFont}}>{currentResult.attributes.name}</p>
              </div>
              :
              <>
              <img src={logosBlur} alt='blurred logos background' className='logo-background' />
              <div className='logo-text-box'>
                <p className='logo-text'>Want a custom generated logo?</p>
                <button className='logo-button' onClick={generateLogo}>Generate logo</button>
              </div>
              </>
            }
        </div>
        <div className='interaction'>
          <div className='feat-inter-header'>
            <h3>Example Interaction</h3>
          </div>
          <div className='feat-inter-text'>
            {interactions}
          </div>
        </div>
      </div>
      <DemoCarousel videos={videos} />
    </section>}
  </>
  )
}

export default Results
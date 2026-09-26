import { useMemo, useState } from 'react';
import {
  Activity, ArrowRight, Bot, Box, BookOpen, CheckCircle2, ChevronRight, Cloud,
  Code2, Database, FileBox, Gamepad2, Github, Globe2, Headphones, Layers3,
  Menu, Package, Rocket, Search, Settings2, ShieldCheck, Sparkles, Terminal,
  TestTube2, Wand2, X, Zap
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import styles from './_index.module.css';

const nav: Array<[string, LucideIcon]> = [
  ['Dashboard', Activity], ['Projects', Layers3], ['AI Agents', Bot], ['Game DNA', Database],
  ['Story Generator', BookOpen], ['Builders', Wand2], ['Assets', Box], ['Audio', Headphones],
  ['3D Pipeline', Package], ['Models / GGUF', Terminal], ['Hugging Face', Globe2],
  ['GitHub', Github], ['Cloud', Cloud], ['Build Center', Rocket], ['QA', TestTube2],
  ['Providers', Globe2], ['Agent Builder', Bot], ['Logs', Activity], ['Settings', Settings2],
];

const genres = [
  ['Party Games','Trivia · social deduction · mini-games','AI host + rooms'],
  ['Card Games','Deck builders · battlers · campaigns','Rules engine + AI'],
  ['Casino-Style','Slots · roulette · dice · blackjack-style','Virtual / no cash'],
  ['Board Games','Tiles · strategy · resources · area control','Digital tabletop'],
  ['Couples & Intimacy','Romance · communication · date-night','Consent + boundaries'],
  ['Mature Games 18+','Horror · crime · dark romance · mature themes','Age gate + ratings'],
];

const modules: Array<[string, string, LucideIcon]> = [
  ['Game DNA','Mechanics, states, economy, progression, save/load',Database],
  ['AI Story Generator','Bible → chapters → scenes → branches → endings',BookOpen],
  ['Game Builder Hub','Prompt-to-game, ideation and 3D builder adapters',Wand2],
  ['Asset Factory','2D, characters, worlds, props, UI, VFX, materials',Box],
  ['Audio & Dubbing','Music, SFX, ambience, voices, TTS and localization',Headphones],
  ['3D Asset Pipeline','Text/image/multi-view → PBR → rig → animation',Package],
  ['Local Models / GGUF','Chat, code, image, video, embeddings and speech',Terminal],
  ['Hugging Face','Model cards, licenses, files, quantization and queues',Globe2],
  ['Files','Projects, models, assets, builds, checksums and versions',FileBox],
  ['GitHub','Repos, branches, commits, PRs, issues and CI',Github],
  ['Cloud Workspace','Compute profiles, queues, artifacts and logs',Cloud],
  ['Build Center','Debug/test/staging/release APK, AAB and web',Rocket],
  ['QA / Tests','Regression, device, performance, crash and release gates',TestTube2],
  ['Security & IP','Secrets, permissions, licenses and compliance gates',ShieldCheck],
  ['Multi-Provider AI','OpenAI, Gemini, Anthropic, xAI, Mistral, Groq, DeepSeek, Qwen, OpenRouter and more',Globe2],
  ['No-Code Agent Builder','Visual agent graph, tools, memory, approvals, tests and deployment',Bot],
];

const pipeline = ['Idea','Research','Game DNA','Logic','Assets','3D','Audio','Build','Playtest','QA','Release'];
const agents = [
  ['A00','Factory Director','Orchestrates every run','ACTIVE'],['A02','Creative Director','Vision, tone, references','READY'],
  ['A04','Game Designer','Mechanics and systems','READY'],['A09','Narrative Director','Story, branching, continuity','READY'],
  ['A16','3D Asset Agent','Models, materials, export','READY'],['A27','Gameplay Engineer','Runtime mechanics','READY'],
  ['A33','Android Engineer','Mobile packaging and device rules','READY'],['A50','Build / Release','Builds, signing gates, artifacts','READY'],
  ['A51','QA Director','Release gates and regression','READY'],['A61','Game Knowledge','Public reference knowledge','READY'],
];
const engines = ['Unreal','Unity','Godot','Cocos Creator','Defold','Stride','MonoGame','Bevy','O3DE','Ren\'Py','HTML5 / Web'];

export default function Index() {
  const [active, setActive] = useState('Dashboard');
  const [running, setRunning] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [query, setQuery] = useState('');
  const [storyPrompt, setStoryPrompt] = useState('');
  const [notice, setNotice] = useState('');
  const filteredModules = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return modules;
    return modules.filter(([name, desc]) => (name + ' ' + desc).toLowerCase().includes(q));
  }, [query]);
  const go = (name: string) => { setActive(name); setMobileMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const action = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 3200); };
  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <img className={styles.studioLogo} src="/_cdn/static/8e5a7e3c-94bb-43ba-b528-13c5ae30846a-file_00000000bacc8246b8efc358e7b8cc94.jpg" alt="Mojealterego — Andrzej Mikulski" />
          <div><div className={styles.kicker}>MOJEALTEREGO STUDIO</div><h1>AI GAME FACTORY</h1><span className={styles.productLine}>MOBILE COMMAND CENTER · v1</span></div>
        </div>
        <div className={styles.headerRight}><div className={styles.status}><span className={styles.dot} /> ONLINE <Badge variant="outline">ANDROID-FIRST</Badge></div><button className={styles.menuButton} onClick={() => setMobileMenu(!mobileMenu)} aria-label="Menu">{mobileMenu ? <X size={20}/> : <Menu size={20}/>}</button></div>
      </header>
      <nav className={mobileMenu ? styles.sideNavOpen : styles.sideNav}>
        <div className={styles.navLabel}>FACTORY OS</div>
        {nav.map(([name, Icon]) => <button key={name} className={active===name ? styles.navActive : styles.navItem} onClick={() => go(name)}><Icon size={16}/><span>{name}</span>{active===name && <i/>}</button>)}
      </nav>
      <section className={styles.topbar}>
        <div className={styles.breadcrumb}><span>FACTORY</span><ChevronRight size={13}/><strong>{active.toUpperCase()}</strong></div>
        <label className={styles.search}><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search modules, agents, engines…" /><kbd>⌘ K</kbd></label>
      </section>
      {notice && <div className={styles.notice}><CheckCircle2 size={16}/>{notice}</div>}
      {active === 'Dashboard' && <Dashboard running={running} setRunning={setRunning} action={action} go={go}/>}
      {active === 'Projects' && <Projects action={action}/>}
      {active === 'AI Agents' && <Agents action={action}/>}
      {active === 'Game DNA' && <GameDNA action={action}/>}
      {active === 'Story Generator' && <StoryGenerator prompt={storyPrompt} setPrompt={setStoryPrompt} action={action}/>}
      {active === 'Builders' && <Builders action={action}/>}
      {active === 'Assets' && <Assets action={action}/>}
      {active === 'Audio' && <Audio action={action}/>}
      {active === '3D Pipeline' && <ThreeD action={action}/>}
      {active === 'Models / GGUF' && <Models action={action}/>}
      {active === 'Hugging Face' && <Hugging action={action}/>}
      {active === 'GitHub' && <GitHubPanel action={action}/>}
      {active === 'Cloud' && <CloudPanel action={action}/>}
      {active === 'Build Center' && <BuildCenter action={action}/>}
      {active === 'QA' && <QA action={action}/>}
      {active === 'Providers' && <Providers action={action}/>}
      {active === 'Agent Builder' && <AgentBuilder action={action}/>}
      {active === 'Logs' && <Logs/>}
      {active === 'Settings' && <Settings/>}
      {active === 'Dashboard' && <section className={styles.modules}>
        <div className={styles.sectionHead}><div><div className={styles.kicker}>FACTORY MODULES</div><h3>Everything in one workspace</h3></div><span className={styles.mono}>14 CORE SYSTEMS</span></div>
        <div className={styles.moduleGrid}>{filteredModules.map(([name,desc,Icon]) => <button className={styles.module} key={name} onClick={()=>go(name)}><span className={styles.moduleIcon}><Icon size={18}/></span><span><strong>{name}</strong><small>{desc}</small></span><ArrowRight size={15}/></button>)}</div>
      </section>}
      {active === 'Dashboard' && <section className={styles.worlds}>
        <div className={styles.sectionHead}><div><div className={styles.kicker}>GAME WORLDS & GENRES</div><h3>From party games to cinematic worlds</h3></div><Badge variant="outline">ENGINE-AGNOSTIC</Badge></div>
        <div className={styles.genreGrid}>{genres.map(([name,desc,meta])=><article className={styles.genre} key={name}><div className={styles.genreMark}><Gamepad2 size={17}/></div><div><h4>{name}</h4><p>{desc}</p><span>{meta}</span></div></article>)}</div>
      </section>}
      <footer className={styles.footer}><span>MOJEALTEREGO</span><span>AI GAME FACTORY</span><span>PUBLIC PATTERNS · NO PROPRIETARY CODE</span></footer>
    </main>
  );
}

function Dashboard({running,setRunning,action,go}:{running:boolean;setRunning:(v:boolean)=>void;action:(s:string)=>void;go:(s:string)=>void}) {
  return <div className={styles.content}>
    <section className={styles.hero}><div className={styles.heroCopy}><div className={styles.kicker}>FACTORY CONTROL CENTER</div><h2>Idea in.<br/><em>Game out.</em></h2><p>A mobile-first production operating system for game design, narrative, AI agents, assets, 3D, audio, cloud builds and QA.</p><div className={styles.actions}><Button onClick={()=>{setRunning(!running);action(running?'Factory run paused.':'Factory run queued locally; connect cloud providers to execute generation.')}}>{running?'Pause Factory Run':'Start Factory Run'}</Button><Button variant="outline" onClick={()=>go('Story Generator')}><Sparkles size={15}/> AI Story Generator</Button></div></div><div className={styles.heroOrb}><div className={styles.orbRing}/><div className={styles.orbCore}><Zap size={25}/><span>FACTORY</span><b>{running?'RUNNING':'READY'}</b></div></div></section>
    <section className={styles.pipeline}><div className={styles.pipelineTitle}>PRODUCTION PIPELINE</div>{pipeline.map((step,i)=><div className={styles.pipe} key={step}><span>{String(i+1).padStart(2,'0')}</span>{step}{i<pipeline.length-1&&<b>→</b>}</div>)}</section>
    <section className={styles.grid}><article className={styles.panel}><div className={styles.panelHead}><div><div className={styles.kicker}>FACTORY STATUS</div><h3>{running?'Execution in progress':'Ready for project'}</h3></div><Badge>{running?'RUNNING':'READY'}</Badge></div><div className={styles.metrics}><Metric n="61" l="AI agents"/><Metric n="11" l="pipeline stages"/><Metric n="10+" l="engine adapters"/><Metric n="0" l="release blockers"/></div><div className={styles.progress}><span/><i style={{width:running?'38%':'8%'}}/></div><div className={styles.micro}>Core orchestration is UI-ready. External providers and cloud compute remain explicitly configurable.</div></article><article className={styles.panel}><div className={styles.panelHead}><div><div className={styles.kicker}>CLOUD WORKSPACE</div><h3>Compute & artifacts</h3></div><Badge variant="outline">CONFIGURABLE</Badge></div><div className={styles.rows}><Row a="Build queue" b="0 jobs"/><Row a="Artifact storage" b="READY"/><Row a="Android package" b="APK / AAB"/><Row a="Secrets" b="BACKEND ONLY"/><Row a="GitHub" b="READY TO CONNECT"/></div></article></section>
    <section className={styles.builderStrip}><div><div className={styles.kicker}>BUILDER FUSION</div><h3>Rosebud × Ludo × Tripo patterns</h3><p>Prompt-to-game loop · research/GDD loop · text/image/multi-view 3D pipeline.</p></div><Button variant="outline" onClick={()=>go('Builders')}>Open Builder Hub <ArrowRight size={15}/></Button></section>
  </div>;
}
function Metric({n,l}:{n:string;l:string}){return <div className={styles.metric}><strong>{n}</strong><span>{l}</span></div>}
function Row({a,b}:{a:string;b:string}){return <div className={styles.row}><span>{a}</span><b>{b}</b></div>}
function Section({eyebrow,title,children,action}:{eyebrow:string;title:string;children:React.ReactNode;action?:React.ReactNode}){return <div className={styles.content}><section className={styles.sectionHero}><div><div className={styles.kicker}>{eyebrow}</div><h2>{title}</h2></div>{action}</section>{children}</div>}
function Projects({action}:{action:(s:string)=>void}){return <Section eyebrow="PROJECTS" title="Your game portfolio"><div className={styles.projectGrid}><article className={styles.projectCard}><span className={styles.projectCode}>AGF / 001</span><h3>New Project</h3><p>Start from an empty Game DNA, a template, or an AI Story.</p><div className={styles.tags}><Badge>UNASSIGNED ENGINE</Badge><Badge variant="outline">DRAFT</Badge></div><Button onClick={()=>action('Project workspace created as a local draft. Cloud persistence is not connected yet.')}>Create project</Button></article><article className={styles.projectCard}><span className={styles.projectCode}>TEMPLATE LIBRARY</span><h3>Production templates</h3><p>Mobile casual · narrative · RPG · racing · party · card · board · mature 18+.</p><Button variant="outline" onClick={()=>action('Template library opened. Select a genre to seed Game DNA.')}>Browse templates</Button></article></div></Section>}
function Agents({action}:{action:(s:string)=>void}){return <Section eyebrow="AI AGENTS" title="61-agent studio"><div className={styles.agentGrid}>{agents.map(([id,name,desc,status])=><article className={styles.agent} key={id}><span className={styles.agentId}>{id}</span><div><h4>{name}</h4><p>{desc}</p></div><Badge variant="outline">{status}</Badge><button onClick={()=>action(id+' '+name+': inspection panel queued. No remote job was started.')}><ChevronRight size={16}/></button></article>)}</div><div className={styles.note}><Bot size={17}/><span>Each agent is designed around inputs, outputs, dependencies, permissions, approval gates, evidence, retry/pause and handoff. Execution requires connected backends.</span></div></Section>}
function GameDNA({action}:{action:(s:string)=>void}){return <Section eyebrow="GAME DNA" title="Engine-agnostic design system"><div className={styles.dnaGrid}>{['Core loop','Player states','Mechanics','Economy','Inventory','Quests','Dialogue','Relationships','Progression','Save / Load','Achievements','Analytics events'].map((x,i)=><button key={x} className={styles.dnaCard} onClick={()=>action(x+': schema editor selected. No project data was changed.')}><span>{String(i+1).padStart(2,'0')}</span><strong>{x}</strong><small>Variables · events · conditions · actions</small></button>)}</div><div className={styles.engineRail}>{engines.map(e=><span key={e}>{e}</span>)}</div></Section>}
function StoryGenerator({prompt,setPrompt,action}:{prompt:string;setPrompt:(v:string)=>void;action:(s:string)=>void}){return <Section eyebrow="AI STORY GENERATOR" title="Prompt → story → game" action={<Badge variant="outline">CONTINUITY-FIRST</Badge>}><div className={styles.storyLayout}><article className={styles.storyComposer}><div className={styles.composerTop}><span>NEW STORY</span><Badge>CANON LOCK</Badge></div><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Describe the world, protagonist, conflict, tone and audience…"/><div className={styles.chips}><span>Story Bible</span><span>Characters</span><span>Branches</span><span>Endings</span><span>Voice</span><span>Music</span><span>Cinematic</span></div><Button onClick={()=>action(prompt.trim()?'Story blueprint queued from '+prompt.length+' characters. Connect an AI provider to generate content.':'Add a story premise first.')}>Queue Story Blueprint <ArrowRight size={15}/></Button></article><aside className={styles.storyRail}><Row a="Story Bible" b="PERSISTENT"/><Row a="Character identity" b="LOCKED"/><Row a="Continuity memory" b="READY"/><Row a="Branches / endings" b="SUPPORTED"/><Row a="Multilingual" b="12 LANGUAGES"/><Row a="Story → game" b="AVAILABLE"/></aside></div><div className={styles.storyFeatures}>{['Guided chapters','Selective regeneration','Choices & consequences','Visual references','Narration & music','Continuity Doctor'].map(x=><div key={x}><CheckCircle2 size={15}/>{x}</div>)}</div></Section>}
function Builders({action}:{action:(s:string)=>void}){return <Section eyebrow="GAME BUILDER HUB" title="Normalized builder patterns"><div className={styles.builderGrid}>{[['PROMPT-TO-GAME','Idea → spec → code → preview → playtest → repair'],['GAME IDEATION','Research → concept → GDD → mechanics → asset plan'],['3D FACTORY','Text / image / multi-view → retopo → PBR → rig → animation'],['CINEMATIC NARRATIVE','Story graph → shots → choices → consequences → QA']].map(([a,b])=><article key={a} className={styles.builderCard}><span>{a}</span><h3>{b}</h3><Button variant="outline" onClick={()=>action(a+': builder workflow selected. Execution remains provider-dependent.')}>Open workflow</Button></article>)}</div></Section>}
function Assets({action}:{action:(s:string)=>void}){return <Section eyebrow="ASSET FACTORY" title="One pipeline for every asset"><div className={styles.assetGrid}>{['Concept Art','Characters','Environments','Props','Vehicles','UI / Icons','Materials','VFX','Animation','Thumbnails','Marketing Art','Export Packs'].map((x,i)=><button className={styles.asset} key={x} onClick={()=>action(x+': asset job prepared. No generation provider is connected.')}><span>{String(i+1).padStart(2,'0')}</span><strong>{x}</strong><small>Prompt · reference · style lock · variations</small></button>)}</div></Section>}
function Audio({action}:{action:(s:string)=>void}){return <Section eyebrow="AUDIO & DUBBING" title="Music, voice and localization"><div className={styles.audioGrid}>{['Music Composer','Adaptive Music','SFX','Foley / Ambience','Voice Casting','TTS / Dialogue','Dubbing','Localization'].map(x=><article className={styles.audioCard} key={x}><Headphones size={17}/><h4>{x}</h4><p>Language · emotion · intensity · pronunciation · takes</p><button onClick={()=>action(x+': audio pipeline selected.')}>Configure <ArrowRight size={14}/></button></article>)}</div></Section>}
function ThreeD({action}:{action:(s:string)=>void}){return <Section eyebrow="3D ASSET PIPELINE" title="From reference to game-ready"><div className={styles.threeD}><div className={styles.threeDSteps}>{['Text / Image','Multi-view','Mesh','Segmentation','Retopology','PBR','Rig','Animation','Export'].map((x,i)=><div key={x}><span>{i+1}</span><b>{x}</b>{i<8&&<ArrowRight size={13}/>}</div>)}</div><div className={styles.panel}><div className={styles.rows}><Row a="Target" b="GAME-READY 3D"/><Row a="Formats" b="GLB · FBX · OBJ"/><Row a="Materials" b="PBR"/><Row a="Budget" b="PROJECT-SPECIFIC"/><Row a="Provider" b="NOT CONNECTED"/></div><Button variant="outline" onClick={()=>action('3D pipeline staged. Connect Tripo or another provider to execute.')}>Stage 3D job</Button></div></div></Section>}
  function Models({action}:{action:(s:string)=>void}){return <Section eyebrow="LOCAL MODELS / GGUF" title="Two-slot local AI architecture"><div className={styles.modelGrid}>
    {['PRIMARY GGUF · LARGE','SECONDARY GGUF · SMALL'].map((x,i)=><article className={styles.modelCard} key={x}><span>{x}</span><h3>{i===0?'Large reasoning / coding model':'Small fast assistant model'}</h3><p>Path · size · quantization · context · RAM/VRAM · threads · GPU offload · checksum</p><Badge variant="outline">ANDROID / CLOUD</Badge><button onClick={()=>action(x+': configuration panel selected.')}>Configure model</button><button onClick={()=>action(x+': Hugging Face import queue prepared; no download started.')}>Import from Hugging Face</button></article>)}
    {['IMAGE / VISION','VIDEO','EMBEDDING','SPEECH'].map(x=><article className={styles.modelCard} key={x}><span>{x}</span><h3>Optional provider slot</h3><p>Cloud-first slot with local capability when the Android runtime supports it.</p><Badge variant="outline">HYBRID</Badge><button onClick={()=>action(x+': provider/model slot selected.')}>Manage slot</button></article>)}
  </div><div className={styles.note}><Terminal size={17}/><span>Large + Small GGUF can be assigned independently: PRIMARY for quality/deep tasks, SECONDARY for fast routing, summarization and fallback. Exact Android support depends on RAM, quantization and runtime.</span></div></Section>}
  function Hugging({action}:{action:(s:string)=>void}){return <Section eyebrow="HUGGING FACE" title="GGUF discovery → verification → download queue"><div className={styles.panel}><div className={styles.searchLarge}><Search size={17}/><span>Search GGUF models, quantizations, files and model cards…</span></div><div className={styles.actionGrid}>{['Search GGUF','Filter by size','Filter quantization','Inspect model card','Verify license','Queue large model','Queue small model','Download to cloud','Prepare device import'].map(x=><button key={x} onClick={()=>action(x+': workflow staged. External Hugging Face access must be connected before transfer.')}><Globe2 size={15}/>{x}<ArrowRight size={14}/></button>)}</div><div className={styles.rows}><Row a="License" b="REQUIRED CHECK"/><Row a="Files / size" b="VISIBLE BEFORE IMPORT"/><Row a="Quantization" b="FILTERABLE"/><Row a="Checksum" b="RECORDED"/><Row a="Target" b="CLOUD / DEVICE*"/></div></div><div className={styles.note}><Globe2 size={17}/><span>Model files are never silently executed. The factory records source, version, license, checksum and compatibility before installation.</span></div></Section>}
function GitHubPanel({action}:{action:(s:string)=>void}){return <Section eyebrow="GITHUB" title="Source control without a desktop"><div className={styles.githubHero}><Github size={32}/><div><h3>mojealterego / Ai-game-factory</h3><p>Repository detected. Project source can be mapped here without exposing tokens in the client.</p></div><Badge variant="outline">READY</Badge></div><div className={styles.actionGrid}>{['Sync repository','Branch','Commit','Pull Request','Issues','CI / Actions'].map(x=><button key={x} onClick={()=>action(x+': action staged. Repository write is not executed from this screen.')}><Code2 size={16}/>{x}<ArrowRight size={14}/></button>)}</div></Section>}
function CloudPanel({action}:{action:(s:string)=>void}){return <Section eyebrow="CLOUD WORKSPACE" title="Heavy work belongs in the cloud"><div className={styles.cloudGrid}>{[['Compute','CPU / GPU profiles · queues'],['Artifacts','APK · AAB · builds · media'],['Secrets','Backend-only credential vault'],['Playtest','Preview · device matrix'],['Storage','Versioned project files'],['Observability','Logs · jobs · failures']].map(([a,b])=><article className={styles.cloudCard} key={a}><Cloud size={17}/><h4>{a}</h4><p>{b}</p><Badge variant="outline">CONFIGURABLE</Badge></article>)}</div><Button onClick={()=>action('Cloud workspace setup opened. No compute job was started.')}>Configure workspace</Button></Section>}
function BuildCenter({action}:{action:(s:string)=>void}){return <Section eyebrow="BUILD CENTER" title="Release pipeline"><div className={styles.buildPanel}><div className={styles.releaseLine}><div><span className={styles.kicker}>ANDROID</span><h3>APK / AAB</h3><p>Debug · test · staging · release</p></div><Badge variant="outline">SIGNING GATE</Badge></div><div className={styles.releaseSteps}>{['Source','Compile','Package','Sign','QA','Artifact'].map((x,i)=><div key={x}><span>{i+1}</span>{x}</div>)}</div><Button onClick={()=>action('Build request prepared. No APK was built yet because a cloud build provider is not connected.')}>Prepare release build</Button></div></Section>}
function QA({action}:{action:(s:string)=>void}){return <Section eyebrow="QA / TESTS" title="Release gates before distribution"><div className={styles.qaGrid}>{['Gameplay','UI / UX','Regression','Performance','Memory','Save / Load','Device Lab','Crash Analysis','Store Compliance','IP / Licenses'].map((x,i)=><article key={x} className={styles.qaCard}><span>{String(i+1).padStart(2,'0')}</span><h4>{x}</h4><Badge variant="outline">NOT RUN</Badge><button onClick={()=>action(x+': test plan prepared. Execution requires a build artifact.')}>Prepare</button></article>)}</div></Section>}
  const providers = ['OpenAI','Google Gemini','Anthropic Claude','xAI Grok','Mistral','Cohere','Groq','DeepSeek','Qwen','OpenRouter','Together AI','Fireworks AI','Perplexity','Hugging Face','Replicate','Fal.ai','Stability AI','ElevenLabs','Runway','Kling','Luma','Azure OpenAI','AWS Bedrock','Google Vertex AI','Custom OpenAI-compatible'];
  function Providers({action}:{action:(s:string)=>void}){return <Section eyebrow="MULTI-PROVIDER AI" title="One routing layer for every model provider"><div className={styles.panel}><div className={styles.rows}><Row a="Routing" b="AUTO / MANUAL / FALLBACK"/><Row a="Secrets" b="BACKEND VAULT ONLY"/><Row a="Scopes" b="PER-PROVIDER"/><Row a="Health" b="TEST CONNECTION"/><Row a="Failover" b="SECONDARY MODEL"/></div></div><div className={styles.actionGrid}>{providers.map((p,i)=><button key={p} onClick={()=>action(p+': provider selected. Configure endpoint, API key, model policy and fallback in the secure backend.') }><Globe2 size={15}/><span>{p}</span><Badge variant="outline">{i<3?'CORE':'ADAPTER'}</Badge><ArrowRight size={14}/></button>)}</div><div className={styles.note}><ShieldCheck size={17}/><span>Provider adapters are normalized behind one internal interface: chat, structured output, tool calling, embeddings, image, video, speech and music where the provider supports them. Keys are never rendered back to the client.</span></div></Section>}
  function AgentBuilder({action}:{action:(s:string)=>void}){return <Section eyebrow="NO-CODE AGENT BUILDER" title="Build agents visually — no programming required"><div className={styles.builderGrid}><article className={styles.builderCard}><span>01 · TRIGGER</span><h3>Prompt · schedule · webhook · project event</h3><Button variant="outline" onClick={()=>action('Trigger node added to agent canvas.')}>Add trigger</Button></article><article className={styles.builderCard}><span>02 · BRAIN</span><h3>Provider → model → system policy → fallback</h3><Button variant="outline" onClick={()=>action('Model node added to agent canvas.')}>Add model</Button></article><article className={styles.builderCard}><span>03 · TOOLS</span><h3>GitHub · files · web · Hugging Face · build · QA</h3><Button variant="outline" onClick={()=>action('Tool node added to agent canvas.')}>Add tool</Button></article><article className={styles.builderCard}><span>04 · MEMORY</span><h3>Project memory · Story Bible · vector/context store</h3><Button variant="outline" onClick={()=>action('Memory node added to agent canvas.')}>Add memory</Button></article><article className={styles.builderCard}><span>05 · GUARDRAILS</span><h3>Permissions · approval gates · budgets · licenses</h3><Button variant="outline" onClick={()=>action('Approval gate added to agent canvas.')}>Add gate</Button></article><article className={styles.builderCard}><span>06 · OUTPUT</span><h3>Code · asset · model · APK/AAB · report · PR</h3><Button variant="outline" onClick={()=>action('Output node added to agent canvas.')}>Add output</Button></article></div><div className={styles.panel}><div className={styles.panelHead}><div><div className={styles.kicker}>AGENT BLUEPRINT</div><h3>Research → Design → Build → QA → Release</h3></div><Badge variant="outline">NO-CODE</Badge></div><div className={styles.pipeline}>{['Trigger','Intent','Planner','Provider Router','Tools','Memory','Approval','Executor','QA','Evidence'].map((x,i)=><div className={styles.pipe} key={x}><span>{String(i+1).padStart(2,'0')}</span>{x}{i<9&&<b>→</b>}</div>)}</div><Button onClick={()=>action('Agent blueprint saved locally as a draft. Deployment requires a connected execution backend.')}>Save agent blueprint</Button></div></Section>}
function Logs(){return <Section eyebrow="ACTIVITY / LOGS" title="Evidence, not assumptions"><div className={styles.logPanel}>{['Factory initialized','Mojealterego logo loaded','AI GAME FACTORY icon configured','Game Builder Hub configured','AI Story Generator configured','Provider connections: not configured','Cloud builds: not configured'].map((x,i)=><div key={x}><span>0{i+1}</span><b>{x}</b><em>{i<5?'SYSTEM':'CONFIG'}</em></div>)}</div></Section>}
function Settings(){return <Section eyebrow="SETTINGS & BRAND" title="Factory configuration"><div className={styles.settingsGrid}>{['Language & Localization','Brand / Mojealterego','API Keys & Integrations','GGUF / Local Models','Hugging Face','GitHub','Cloud Workspace','Build Defaults','Notifications','Permissions','Privacy & Security','About'].map(x=><article className={styles.setting} key={x}><Settings2 size={16}/><strong>{x}</strong><ChevronRight size={15}/></article>)}</div></Section>}
package ai.gamefactory.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val Obsidian = Color(0xFF08080A)
private val Panel = Color(0xFF141417)
private val Panel2 = Color(0xFF1D1D22)
private val Gold = Color(0xFFD4AF37)
private val Muted = Color(0xFF9B9BA4)
private val Green = Color(0xFF61D095)
private val Red = Color(0xFFFF6B6B)

private data class FactoryState(
    val project: String = "Brak aktywnego projektu",
    val pipeline: String = "IDLE",
    val agents: String = "IDLE",
    val cloud: String = "READY",
    val models: String = "READY",
    val build: String = "READY",
    val qa: String = "NOT RUN",
    val artifact: String = "NONE",
    val message: String = "Factory gotowa."
)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { FactoryApp() }
    }
}

@Composable
private fun FactoryApp() {
    var state by remember { mutableStateOf(FactoryState()) }
    var section by remember { mutableStateOf("FACTORY") }
    var showNewProject by remember { mutableStateOf(false) }

    MaterialTheme {
        Surface(Modifier.fillMaxSize(), color = Obsidian) {
            Column(Modifier.fillMaxSize()) {
                FactoryHeader(section)
                Box(Modifier.weight(1f)) {
                    when (section) {
                        "PROJECTS" -> ProjectsScreen(
                            state = state,
                            onNewProject = { showNewProject = true },
                            onOpenFactory = { section = "FACTORY" }
                        )
                        "AGENTS" -> AgentsScreen(state)
                        "BUILD" -> BuildScreen(
                            state = state,
                            onRun = {
                                state = state.copy(
                                    pipeline = "BUILD → QA → RELEASE",
                                    agents = "RUNNING",
                                    build = "RUNNING",
                                    qa = "RUNNING",
                                    artifact = "QUEUED",
                                    message = "Build pipeline uruchomiony."
                                )
                            }
                        )
                        else -> DashboardScreen(
                            state = state,
                            onNewProject = { showNewProject = true },
                            onRunFactory = {
                                state = state.copy(
                                    project = if (state.project == "Brak aktywnego projektu") "android-session-project" else state.project,
                                    pipeline = "GAME IDEA → GAME DNA",
                                    agents = "RUNNING",
                                    message = "Factory uruchomiona."
                                )
                            },
                            onBuild = { section = "BUILD" }
                        )
                    }
                }
                BottomBar(section) { section = it }
            }
        }
    }

    if (showNewProject) {
        NewProjectDialog(
            onDismiss = { showNewProject = false },
            onCreate = { name ->
                state = state.copy(
                    project = name,
                    pipeline = "PROJECT CREATED",
                    agents = "READY",
                    qa = "NOT RUN",
                    artifact = "NONE",
                    message = "Projekt \"$name\" utworzony."
                )
                showNewProject = false
            }
        )
    }
}

@Composable
private fun FactoryHeader(section: String) {
    Column(
        Modifier.fillMaxWidth().background(Obsidian).padding(horizontal = 20.dp, vertical = 18.dp)
    ) {
        Text(
            "AI GAME FACTORY",
            color = Gold,
            fontSize = 25.sp,
            fontWeight = FontWeight.Black,
            letterSpacing = 1.6.sp
        )
        Spacer(Modifier.height(4.dp))
        Text(
            "ANDROID CONTROL CENTER  •  $section",
            color = Color.White,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp
        )
    }
}

@Composable
private fun DashboardScreen(
    state: FactoryState,
    onNewProject: () -> Unit,
    onRunFactory: () -> Unit,
    onBuild: () -> Unit
) {
    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Card(
            colors = CardDefaults.cardColors(containerColor = Panel2),
            shape = RoundedCornerShape(24.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("TELEFON = CENTRUM DOWODZENIA", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Text(
                    "Control Center dla projektów, agentów, modeli, assetów, QA i buildów AI GAME FACTORY.",
                    color = Muted, fontSize = 14.sp, lineHeight = 20.sp
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.width(8.dp).height(8.dp).background(Green, RoundedCornerShape(8.dp)))
                    Spacer(Modifier.width(8.dp))
                    Text("CONTROL PLANE ONLINE", color = Green, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        Text("SYSTEM STATUS", color = Gold, fontSize = 12.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
        StatusGrid(state)

        Text("ACTIVE PROJECT", color = Gold, fontSize = 12.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
        Card(
            colors = CardDefaults.cardColors(containerColor = Panel),
            shape = RoundedCornerShape(18.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(state.project, color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                Text(state.message, color = Muted, fontSize = 13.sp)
            }
        }

        Text("FACTORY PIPELINE", color = Gold, fontSize = 12.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
        Card(colors = CardDefaults.cardColors(containerColor = Panel), shape = RoundedCornerShape(18.dp), modifier = Modifier.fillMaxWidth()) {
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(state.pipeline, color = Gold, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                Text(
                    "IDEA → GAME DNA → STORY → ASSETS → LOGIC → AUDIO → 3D → QA → BUILD → RELEASE",
                    color = Color.White, fontSize = 12.sp, lineHeight = 18.sp
                )
            }
        }

        Text("ACTIONS", color = Gold, fontSize = 12.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            ActionButton("NEW PROJECT", Modifier.weight(1f), onNewProject)
            ActionButton("RUN FACTORY", Modifier.weight(1f), onRunFactory)
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            ActionButton("BUILD CENTER", Modifier.weight(1f), onBuild)
            OutlinedButton(
                onClick = { },
                modifier = Modifier.weight(1f).height(52.dp),
                shape = RoundedCornerShape(14.dp)
            ) { Text("STORY STUDIO", fontSize = 10.sp, fontWeight = FontWeight.Black) }
        }
        Spacer(Modifier.height(12.dp))
    }
}

@Composable
private fun StatusGrid(state: FactoryState) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            StatusCard("AGENTS", state.agents, Modifier.weight(1f))
            StatusCard("CLOUD", state.cloud, Modifier.weight(1f))
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            StatusCard("MODELS", state.models, Modifier.weight(1f))
            StatusCard("BUILD FARM", state.build, Modifier.weight(1f))
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            StatusCard("QA", state.qa, Modifier.weight(1f))
            StatusCard("ARTIFACT", state.artifact, Modifier.weight(1f))
        }
    }
}

@Composable
private fun StatusCard(title: String, value: String, modifier: Modifier) {
    Card(modifier, colors = CardDefaults.cardColors(containerColor = Panel), shape = RoundedCornerShape(16.dp)) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(title, color = Muted, fontSize = 10.sp, fontWeight = FontWeight.Bold)
            Text(value, color = if (value == "RUNNING") Gold else Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun ActionButton(label: String, modifier: Modifier, onClick: () -> Unit) {
    Button(
        modifier = modifier.height(52.dp),
        onClick = onClick,
        shape = RoundedCornerShape(14.dp),
        colors = ButtonDefaults.buttonColors(containerColor = Gold, contentColor = Color.Black)
    ) { Text(label, fontSize = 10.sp, fontWeight = FontWeight.Black) }
}

@Composable
private fun ProjectsScreen(state: FactoryState, onNewProject: () -> Unit, onOpenFactory: () -> Unit) {
    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("PROJECT WORKSPACE", color = Gold, fontSize = 22.sp, fontWeight = FontWeight.Black)
        Text("Twórz i prowadź projekty gier z poziomu telefonu.", color = Muted, fontSize = 14.sp)
        Card(colors = CardDefaults.cardColors(containerColor = Panel), shape = RoundedCornerShape(18.dp), modifier = Modifier.fillMaxWidth()) {
            Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(state.project, color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                Text("Engine: Unreal • Unity • Godot • Web", color = Muted, fontSize = 12.sp)
                Text("Workspace: LOCAL CONTROL PLANE", color = Muted, fontSize = 12.sp)
            }
        }
        ActionButton("CREATE PROJECT", Modifier.fillMaxWidth(), onNewProject)
        OutlinedButton(onClick = onOpenFactory, modifier = Modifier.fillMaxWidth().height(52.dp), shape = RoundedCornerShape(14.dp)) {
            Text("OPEN FACTORY", fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun AgentsScreen(state: FactoryState) {
    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("AI AGENT RUNTIME", color = Gold, fontSize = 22.sp, fontWeight = FontWeight.Black)
        Text("Rejestr agentów A00–A61 i warstwa Factory Core.", color = Muted, fontSize = 14.sp)
        listOf(
            "RUNTIME" to state.agents,
            "REGISTRY" to "A00–A61",
            "ORCHESTRATOR" to "FACTORY CORE",
            "PERMISSIONS" to "CONTROLLED",
            "EVIDENCE" to "AUDITED"
        ).forEach { (label, value) -> InfoRow(label, value) }
    }
}

@Composable
private fun BuildScreen(state: FactoryState, onRun: () -> Unit) {
    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("BUILD CENTER", color = Gold, fontSize = 22.sp, fontWeight = FontWeight.Black)
        Text("Kolejka buildów, QA gate i artefakty wydania.", color = Muted, fontSize = 14.sp)
        InfoRow("BUILD FARM", state.build)
        InfoRow("QA GATE", state.qa)
        InfoRow("ARTIFACT", state.artifact)
        ActionButton("RUN BUILD PIPELINE", Modifier.fillMaxWidth(), onRun)
        Text("Debug APK może być generowany z repozytorium przez CI. Ten ekran jest lokalnym control plane.", color = Muted, fontSize = 12.sp)
    }
}

@Composable
private fun InfoRow(label: String, value: String) {
    Card(colors = CardDefaults.cardColors(containerColor = Panel), shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth()) {
        Row(
            Modifier.fillMaxWidth().padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(label, color = Muted, fontSize = 11.sp, fontWeight = FontWeight.Bold)
            Text(value, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun NewProjectDialog(onDismiss: () -> Unit, onCreate: (String) -> Unit) {
    var name by remember { mutableStateOf("") }
    val valid = name.trim().length >= 2

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("NEW GAME PROJECT", fontWeight = FontWeight.Black) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Podaj nazwę projektu.", color = Muted)
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    singleLine = true,
                    label = { Text("Project name") }
                )
            }
        },
        confirmButton = {
            TextButton(enabled = valid, onClick = { onCreate(name.trim()) }) {
                Text("CREATE", color = if (valid) Gold else Muted, fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("CANCEL") } }
    )
}

@Composable
private fun BottomBar(selected: String, onSelect: (String) -> Unit) {
    Surface(color = Panel, shadowElevation = 10.dp) {
        Row(
            Modifier.fillMaxWidth().padding(horizontal = 6.dp, vertical = 7.dp),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            listOf("FACTORY", "PROJECTS", "AGENTS", "BUILD").forEach { item ->
                val active = item == selected
                OutlinedButton(
                    onClick = { onSelect(item) },
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.outlinedButtonColors(
                        containerColor = if (active) Gold.copy(alpha = 0.15f) else Color.Transparent,
                        contentColor = if (active) Gold else Muted
                    )
                ) {
                    Text(item, fontSize = 8.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

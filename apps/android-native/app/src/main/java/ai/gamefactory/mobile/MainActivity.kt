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
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
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

private val Obsidian = Color(0xFF0A0A0C)
private val Panel = Color(0xFF151518)
private val Panel2 = Color(0xFF1D1D22)
private val Gold = Color(0xFFD4AF37)
private val Muted = Color(0xFF9A9AA3)
private val Green = Color(0xFF61D095)

data class FactoryState(
    val project: String = "Brak aktywnego projektu",
    val pipeline: String = "IDLE",
    val agents: String = "IDLE",
    val cloud: String = "READY",
    val models: String = "READY",
    val build: String = "READY",
    val qa: String = "NOT RUN",
    val artifact: String = "NONE"
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

    MaterialTheme {
        Surface(modifier = Modifier.fillMaxSize(), color = Obsidian) {
            Column(modifier = Modifier.fillMaxSize()) {
                FactoryHeader(section)
                Box(modifier = Modifier.weight(1f)) {
                    when (section) {
                        "PROJECTS" -> ProjectsScreen(state)
                        "AGENTS" -> AgentsScreen(state)
                        "BUILD" -> BuildScreen(state)
                        else -> DashboardScreen(state) {
                            state = state.copy(
                                project = "android-session-project",
                                pipeline = "GAME IDEA → GAME DNA",
                                agents = "READY"
                            )
                        }
                    }
                }
                BottomBar(section) { section = it }
            }
        }
    }
}

@Composable
private fun FactoryHeader(section: String) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Obsidian)
            .padding(horizontal = 20.dp, vertical = 18.dp)
    ) {
        Text(
            "AI GAME FACTORY",
            color = Gold,
            fontSize = 24.sp,
            fontWeight = FontWeight.Black,
            letterSpacing = 1.5.sp
        )
        Spacer(Modifier.height(4.dp))
        Text(
            "ANDROID CONTROL CENTER  •  $section",
            color = Color.White,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp
        )
    }
}

@Composable
private fun DashboardScreen(state: FactoryState, startFactory: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        HeroCard()
        StatusGrid(state)
        SectionTitle("FACTORY PIPELINE")
        PipelineCard(state.pipeline)
        SectionTitle("QUICK ACTIONS")
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            ActionButton("NEW PROJECT", Modifier.weight(1f)) { startFactory() }
            ActionButton("STORY", Modifier.weight(1f)) { }
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            ActionButton("ASSETS", Modifier.weight(1f)) { }
            ActionButton("BUILD", Modifier.weight(1f)) { }
        }
        Spacer(Modifier.height(8.dp))
    }
}

@Composable
private fun HeroCard() {
    Card(
        colors = CardDefaults.cardColors(containerColor = Panel2),
        shape = RoundedCornerShape(24.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("TELEFON = CENTRUM DOWODZENIA", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
            Text(
                "Sterowanie projektami, agentami, modelami, assetami, QA i buildami AI GAME FACTORY.",
                color = Muted,
                fontSize = 14.sp,
                lineHeight = 20.sp
            )
            Spacer(Modifier.height(4.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.width(8.dp).height(8.dp).background(Green, RoundedCornerShape(8.dp)))
                Spacer(Modifier.width(8.dp))
                Text("CONTROL PLANE ONLINE", color = Green, fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
        }
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
private fun StatusCard(title: String, value: String, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = Panel),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(title, color = Muted, fontSize = 10.sp, fontWeight = FontWeight.Bold)
            Text(value, color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun PipelineCard(stage: String) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Panel),
        shape = RoundedCornerShape(18.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(stage, color = Gold, fontSize = 15.sp, fontWeight = FontWeight.Bold)
            Text(
                "IDEA → GAME DNA → STORY → ASSETS → LOGIC → AUDIO → 3D → QA → BUILD → RELEASE",
                color = Color.White,
                fontSize = 12.sp,
                lineHeight = 18.sp
            )
        }
    }
}

@Composable
private fun ActionButton(label: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Button(
        modifier = modifier.height(52.dp),
        onClick = onClick,
        shape = RoundedCornerShape(14.dp),
        colors = ButtonDefaults.buttonColors(containerColor = Gold, contentColor = Color.Black)
    ) {
        Text(label, fontSize = 11.sp, fontWeight = FontWeight.Black)
    }
}

@Composable
private fun ProjectsScreen(state: FactoryState) {
    SimpleModule(
        "PROJECT WORKSPACE",
        "Projekty gier, Game DNA, pliki, wersjonowanie i synchronizacja.",
        listOf("ACTIVE PROJECT" to state.project, "ENGINE ADAPTERS" to "UNREAL • UNITY • GODOT • WEB", "SYNC" to "GITHUB / CLOUD")
    )
}

@Composable
private fun AgentsScreen(state: FactoryState) {
    SimpleModule(
        "AI AGENT RUNTIME",
        "Warstwa sterowania agentami A00–A61 oraz orkiestracją pipeline.",
        listOf("RUNTIME" to state.agents, "REGISTRY" to "A00–A61", "ORCHESTRATOR" to "FACTORY CORE")
    )
}

@Composable
private fun BuildScreen(state: FactoryState) {
    SimpleModule(
        "BUILD CENTER",
        "Kolejka buildów, QA, artefakty i statusy wydania.",
        listOf("BUILD FARM" to state.build, "QA GATE" to state.qa, "ARTIFACT" to state.artifact)
    )
}

@Composable
private fun SimpleModule(title: String, description: String, rows: List<Pair<String, String>>) {
    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(title, color = Gold, fontSize = 22.sp, fontWeight = FontWeight.Black)
        Text(description, color = Muted, fontSize = 14.sp, lineHeight = 20.sp)
        rows.forEach { (label, value) ->
            Card(
                colors = CardDefaults.cardColors(containerColor = Panel),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
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
    }
}

@Composable
private fun BottomBar(selected: String, onSelect: (String) -> Unit) {
    Surface(color = Panel, shadowElevation = 8.dp) {
        Row(
            Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            listOf("FACTORY", "PROJECTS", "AGENTS", "BUILD").forEach { item ->
                val active = item == selected
                OutlinedButton(
                    onClick = { onSelect(item) },
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.outlinedButtonColors(
                        containerColor = if (active) Gold.copy(alpha = 0.14f) else Color.Transparent,
                        contentColor = if (active) Gold else Muted
                    )
                ) {
                    Text(item, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

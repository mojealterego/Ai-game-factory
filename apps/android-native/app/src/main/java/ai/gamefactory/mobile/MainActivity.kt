package ai.gamefactory.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

data class ControlCenterUiState(
    val projectId: String? = null,
    val pipelineStage: String = "IDLE",
    val agents: String = "IDLE",
    val workers: String = "READY",
    val models: String = "READY",
    val buildFarm: String = "READY",
    val qa: String = "NOT RUN",
    val artifact: String = "NONE"
)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { FactoryControlCenter() }
    }
}

@Composable
private fun FactoryControlCenter() {
    var state by remember { mutableStateOf(ControlCenterUiState()) }
    MaterialTheme {
        Column(
            modifier = Modifier.fillMaxSize().padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text("AI GAME FACTORY", style = MaterialTheme.typography.headlineMedium)
            Text("ANDROID CONTROL CENTER", style = MaterialTheme.typography.titleMedium)
            Text("Telefon = centrum dowodzenia całej fabryki")
            Card {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("Factory API: READY")
                    Text("Agent Runtime: ${state.agents}")
                    Text("Project Workspace: ${state.projectId ?: "NO PROJECT"}")
                    Text("Cloud Workers: ${state.workers}")
                    Text("Model Registry: ${state.models}")
                    Text("Build Farm: ${state.buildFarm}")
                    Text("QA: ${state.qa}")
                    Text("Artifact: ${state.artifact}")
                }
            }
            Button(onClick = {
                state = state.copy(projectId = "android-session-project", pipelineStage = "GAME IDEA → GAME DNA", agents = "READY", workers = "READY")
            }) { Text("START GAME FACTORY") }
            Text("Pipeline: ${state.pipelineStage}")
        }
    }
}

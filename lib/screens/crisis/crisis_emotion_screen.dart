import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/crisis_provider.dart';
import '../../providers/data_provider.dart';
import 'crisis_capsule_screen.dart';
import 'breathing_screen.dart';

class CrisisEmotionScreen extends StatelessWidget {
  const CrisisEmotionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final dataProvider = context.watch<DataProvider>();
    final emotions = dataProvider.emotions;

    return Scaffold(
      appBar: AppBar(
        title: const Text('¿Qué sientes?'),
      ),
      body: emotions.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Identifica tu emoción',
                    style: Theme.of(context).textTheme.displaySmall,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Selecciona lo que más se acerca a cómo te sientes ahora',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 32),
                  Expanded(
                    child: GridView.builder(
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                        childAspectRatio: 1.2,
                      ),
                      itemCount: emotions.length,
                      itemBuilder: (context, index) {
                        final emotion = emotions[index];
                        return _EmotionCard(
                          emotion: emotion.name,
                          emoji: _getEmotionEmoji(emotion.name),
                          onTap: () =>
                              _handleEmotionSelected(context, emotion.name),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  String _getEmotionEmoji(String emotionName) {
    final lower = emotionName.toLowerCase();
    if (lower.contains('ansiedad')) return '😰';
    if (lower.contains('miedo')) return '😨';
    if (lower.contains('tristeza')) return '😢';
    if (lower.contains('ira')) return '😠';
    if (lower.contains('alegr')) return '😊';
    return '😐';
  }

  Future<void> _handleEmotionSelected(
      BuildContext context, String emotion) async {
    final crisisProvider = context.read<CrisisProvider>();

    // Show loading
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    await crisisProvider.startCrisis(emotion);

    if (!context.mounted) return;

    // Hide loading
    Navigator.pop(context);

    if (crisisProvider.errorMessage != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(crisisProvider.errorMessage!),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    // Navigate based on whether there's a recommended capsule
    if (crisisProvider.recommendedCapsule != null) {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const CrisisCapsuleScreen()),
      );
    } else {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const BreathingScreen()),
      );
    }
  }
}

class _EmotionCard extends StatelessWidget {
  final String emotion;
  final String emoji;
  final VoidCallback onTap;

  const _EmotionCard({
    required this.emotion,
    required this.emoji,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                emoji,
                style: const TextStyle(fontSize: 48),
              ),
              const SizedBox(height: 12),
              Text(
                emotion,
                style: Theme.of(context).textTheme.titleMedium,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

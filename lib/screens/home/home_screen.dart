import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/local_database_service.dart';
import '../../widgets/app_drawer.dart';
import '../capsules/capsules_screen.dart';
import '../victories/victories_screen.dart';
import '../crisis/crisis_emotion_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final screens = [
      _DashboardView(
        onNavigateToVictories: () {
          setState(() {
            _selectedIndex = 1;
          });
        },
      ),
      const VictoriesScreen(),
      const CapsulesScreen(),
    ];

    return Scaffold(
      body: screens[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.emoji_events),
            label: 'Victorias',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.lightbulb_outline),
            label: 'Cápsulas',
          ),
        ],
      ),
    );
  }
}

class _DashboardView extends StatefulWidget {
  final VoidCallback onNavigateToVictories;

  const _DashboardView({required this.onNavigateToVictories});

  @override
  State<_DashboardView> createState() => _DashboardViewState();
}

class _DashboardViewState extends State<_DashboardView> {
  late Future<Map<String, int>> _metricsFuture;

  @override
  void initState() {
    super.initState();
    _metricsFuture = _loadMetrics();
  }

  Future<Map<String, int>> _loadMetrics() async {
    final capsules = await LocalDatabaseService.countActiveCapsules();
    final victories = await LocalDatabaseService.countWeeklyVictories();
    final crises = await LocalDatabaseService.countTotalCrises();
    return {
      'capsules': capsules,
      'victories': victories,
      'crises': crises,
    };
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final user = authProvider.user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('AWOS'),
        actions: const [AppDrawerButton()],
      ),
      endDrawer: const AppDrawer(),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (user != null) ...[
              Text(
                '¡Hola, ${user.nombrePreferido}!',
                style: Theme.of(context).textTheme.displayMedium,
              ),
              const SizedBox(height: 8),
              Text(
                '¿Cómo te sientes hoy?',
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 32),
            ],
            Row(
              children: [
                Expanded(
                  child: _FeelingButton(
                    emoji: '😊',
                    label: 'BIEN',
                    color: const Color(0xFF86EFAC),
                    onTap: widget.onNavigateToVictories,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _FeelingButton(
                    emoji: '🆘',
                    label: 'EN CRISIS',
                    color: const Color(0xFFFB7185),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const CrisisEmotionScreen(),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 40),
            Text(
              'Resumen',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 16),
            FutureBuilder<Map<String, int>>(
              future: _metricsFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }

                final data = snapshot.data ??
                    {'capsules': 0, 'victories': 0, 'crises': 0};

                return Column(
                  children: [
                    _SummaryCard(
                      icon: Icons.emoji_events,
                      title: 'Victorias esta semana',
                      value: '${data['victories']}',
                      color: const Color(0xFF5EEAD4),
                    ),
                    const SizedBox(height: 12),
                    _SummaryCard(
                      icon: Icons.lightbulb_outline,
                      title: 'Cápsulas activas',
                      value: '${data['capsules']}',
                      color: const Color(0xFFFB923C),
                    ),
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _FeelingButton extends StatelessWidget {
  final String emoji;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _FeelingButton({
    required this.emoji,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 32),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.2),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color, width: 2),
        ),
        child: Column(
          children: [
            Text(
              emoji,
              style: const TextStyle(fontSize: 48),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: color.withValues(alpha: 0.8),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final Color color;

  const _SummaryCard({
    required this.icon,
    required this.title,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 28),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    value,
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import '../../services/mock_api_service.dart';
import '../../models/capsule.dart';
import 'create_capsule_screen.dart';

class CapsulesScreen extends StatefulWidget {
  const CapsulesScreen({super.key});

  @override
  State<CapsulesScreen> createState() => _CapsulesScreenState();
}

class _CapsulesScreenState extends State<CapsulesScreen> {
  final MockApiService _apiService = MockApiService();
  List<Capsule> _capsules = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadCapsules();
  }

  Future<void> _loadCapsules() async {
    setState(() => _isLoading = true);

    try {
      final capsules = await _apiService.getCapsules();
      setState(() {
        _capsules = capsules;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al cargar cápsulas: $e')),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _navigateToCreate() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const CreateCapsuleScreen()),
    );

    if (result == true) {
      _loadCapsules();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mis Cápsulas'),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _navigateToCreate,
        child: const Icon(Icons.add),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _capsules.isEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.lightbulb_outline,
                          size: 64,
                          color: Color(0xFF64748B),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'No tienes cápsulas aún',
                          style: Theme.of(context).textTheme.headlineSmall,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Crea una cápsula personalizada con el botón +',
                          style: Theme.of(context).textTheme.bodyMedium,
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(16.0),
                  itemCount: _capsules.length,
                  separatorBuilder: (context, index) =>
                      const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final capsule = _capsules[index];
                    return _CapsuleCard(capsule: capsule);
                  },
                ),
    );
  }
}

class _CapsuleCard extends StatefulWidget {
  final Capsule capsule;

  const _CapsuleCard({required this.capsule});

  @override
  State<_CapsuleCard> createState() => _CapsuleCardState();
}

class _CapsuleCardState extends State<_CapsuleCard> {
  late bool _isActive;

  @override
  void initState() {
    super.initState();
    _isActive = widget.capsule.isActive;
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    widget.capsule.title,
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                ),
                Switch(
                  value: _isActive,
                  onChanged: (value) {
                    setState(() {
                      _isActive = value;
                    });
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(_isActive
                            ? 'Cápsula activada'
                            : 'Cápsula desactivada'),
                        duration: const Duration(seconds: 1),
                      ),
                    );
                  },
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              widget.capsule.content,
              style: Theme.of(context).textTheme.bodyMedium,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 12),
            Chip(
              label: Text('Emoción ID: ${widget.capsule.emotionId}'),
              backgroundColor: const Color(0xFF5EEAD4).withValues(alpha: 0.2),
              labelStyle: const TextStyle(
                color: Color(0xFF475569),
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

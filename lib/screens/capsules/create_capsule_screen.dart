import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/data_provider.dart';
import '../../services/mock_api_service.dart';

class CreateCapsuleScreen extends StatefulWidget {
  const CreateCapsuleScreen({super.key});

  @override
  State<CreateCapsuleScreen> createState() => _CreateCapsuleScreenState();
}

class _CreateCapsuleScreenState extends State<CreateCapsuleScreen> {
  final _contentFormKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();

  int _currentStep = 0;
  int? _selectedEmotionId;
  bool _isLoading = false;
  int _charCount = 0;

  static const int _maxChars = 500;

  @override
  void initState() {
    super.initState();
    _contentController.addListener(() {
      setState(() {
        _charCount = _contentController.text.length;
      });
    });
  }

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    if (_selectedEmotionId == null) return;

    setState(() => _isLoading = true);

    try {
      final apiService = MockApiService();
      await apiService.createCapsule(
        title: _titleController.text.trim().isEmpty
            ? 'Sin título'
            : _titleController.text.trim(),
        content: _contentController.text.trim(),
        emotionId: _selectedEmotionId!,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Cápsula creada exitosamente'),
            backgroundColor: Color(0xFF22C55E),
            duration: Duration(seconds: 2),
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al crear cápsula: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _goBack() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
    } else {
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final dataProvider = context.watch<DataProvider>();
    final emotions = dataProvider.emotions;

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) _goBack();
      },
      child: Scaffold(
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: _goBack,
          ),
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Nueva Cápsula'),
              if (_currentStep > 0)
                Text(
                  'Paso ${_currentStep + 1} de 3',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.normal,
                  ),
                ),
            ],
          ),
        ),
        body: IndexedStack(
          index: _currentStep,
          children: [
            _buildStep1(),
            _buildStep2(),
            _buildStep3(emotions),
          ],
        ),
      ),
    );
  }

  Widget _buildStep1() {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.lightbulb, size: 64, color: Color(0xFF5EEAD4)),
          const SizedBox(height: 24),
          Text(
            '¿Qué tipo de cápsula quieres crear?',
            style: Theme.of(context).textTheme.displaySmall,
          ),
          const SizedBox(height: 8),
          Text(
            'Elige el formato de tu mensaje personal',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 40),
          Row(
            children: [
              Expanded(
                child: _TypeButton(
                  icon: Icons.text_fields,
                  label: 'TEXTO',
                  subtitle: 'Escribe un mensaje',
                  color: const Color(0xFF5EEAD4),
                  onTap: () {
                    setState(() {
                      _currentStep = 1;
                    });
                  },
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _TypeButton(
                  icon: Icons.mic,
                  label: 'AUDIO',
                  subtitle: 'Próximamente',
                  color: const Color(0xFF94A3B8),
                  disabled: true,
                  onTap: null,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStep2() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Form(
        key: _contentFormKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Escribe tu cápsula',
              style: Theme.of(context).textTheme.displaySmall,
            ),
            const SizedBox(height: 8),
            Text(
              'Tu mensaje personal para momentos difíciles',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 32),
            TextFormField(
              controller: _titleController,
              decoration: const InputDecoration(
                labelText: 'Título (opcional)',
                hintText: 'Ej: Mi afirmación diaria',
                prefixIcon: Icon(Icons.title),
              ),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _contentController,
              minLines: 5,
              maxLines: 10,
              maxLength: _maxChars,
              decoration: const InputDecoration(
                labelText: 'Mensaje',
                hintText: 'Escribe aquí tu mensaje...',
                alignLabelWithHint: true,
                counterText: '',
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'El contenido es requerido';
                }
                if (value.trim().length < 10) {
                  return 'El contenido debe tener al menos 10 caracteres';
                }
                return null;
              },
            ),
            Align(
              alignment: Alignment.centerRight,
              child: Text(
                '$_charCount/$_maxChars',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: _charCount > _maxChars * 0.9
                          ? Colors.orange
                          : const Color(0xFF94A3B8),
                    ),
              ),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  if (_contentFormKey.currentState!.validate()) {
                    setState(() => _currentStep = 2);
                  }
                },
                child: const Padding(
                  padding: EdgeInsets.all(4.0),
                  child: Text('Continuar'),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStep3(List emotions) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '¿Para qué emoción es?',
                style: Theme.of(context).textTheme.displaySmall,
              ),
              const SizedBox(height: 8),
              Text(
                'Esta cápsula se mostrará cuando sientas esto',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          ),
        ),
        Expanded(
          child: emotions.isEmpty
              ? const Center(child: CircularProgressIndicator())
              : ListView(
                  children: emotions.map<Widget>((emotion) {
                    return RadioListTile<int>(
                      value: emotion.id,
                      groupValue: _selectedEmotionId,
                      onChanged: (value) {
                        setState(() => _selectedEmotionId = value);
                      },
                      title: Text(emotion.name),
                      activeColor: const Color(0xFF5EEAD4),
                    );
                  }).toList(),
                ),
        ),
        Padding(
          padding: const EdgeInsets.all(24.0),
          child: SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: (_selectedEmotionId == null || _isLoading)
                  ? null
                  : _handleSave,
              child: Padding(
                padding: const EdgeInsets.all(4.0),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Crear Cápsula'),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _TypeButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final String subtitle;
  final Color color;
  final VoidCallback? onTap;
  final bool disabled;

  const _TypeButton({
    required this.icon,
    required this.label,
    required this.subtitle,
    required this.color,
    required this.onTap,
    this.disabled = false,
  });

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: disabled ? 0.5 : 1.0,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: color, width: 2),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 48, color: color),
              const SizedBox(height: 12),
              Text(
                label,
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: disabled
                          ? const Color(0xFF94A3B8)
                          : const Color(0xFF1E293B),
                    ),
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: const Color(0xFF64748B),
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/crisis_provider.dart';

class PostCrisisReflectionScreen extends StatefulWidget {
  final String crisisId;
  final String evaluation;

  const PostCrisisReflectionScreen({
    super.key,
    required this.crisisId,
    required this.evaluation,
  });

  @override
  State<PostCrisisReflectionScreen> createState() =>
      _PostCrisisReflectionScreenState();
}

class _PostCrisisReflectionScreenState
    extends State<PostCrisisReflectionScreen> {
  final _triggerController = TextEditingController();
  final _otherLocationController = TextEditingController();
  final _otherCompanyController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  String? _selectedLocation;
  String? _selectedCompany;
  String? _selectedSubstance;
  bool _isSaving = false;

  static const _locationOptions = ['Casa', 'Trabajo', 'Calle', 'Otro'];
  static const _companyOptions = ['Solo/a', 'Familia', 'Amigos', 'Otro'];
  static const _substanceOptions = [
    'No',
    'Sí - Alcohol',
    'Sí - Drogas',
    'Sí - Otro',
  ];

  @override
  void dispose() {
    _triggerController.dispose();
    _otherLocationController.dispose();
    _otherCompanyController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedLocation == null ||
        _selectedCompany == null ||
        _selectedSubstance == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Por favor completa todos los campos'),
          backgroundColor: Color(0xFFEF4444),
        ),
      );
      return;
    }

    setState(() => _isSaving = true);

    final location = _selectedLocation == 'Otro'
        ? 'Otro: ${_otherLocationController.text.trim()}'
        : _selectedLocation!;
    final company = _selectedCompany == 'Otro'
        ? 'Otro: ${_otherCompanyController.text.trim()}'
        : _selectedCompany!;

    try {
      final crisisProvider = context.read<CrisisProvider>();
      await crisisProvider.saveReflection(
        crisisId: widget.crisisId,
        trigger: _triggerController.text.trim(),
        location: location,
        company: company,
        substance: _selectedSubstance!,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Reflexión guardada'),
            backgroundColor: Color(0xFF22C55E),
            duration: Duration(seconds: 2),
          ),
        );
        Navigator.of(context).popUntil((route) => route.isFirst);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al guardar: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  Future<void> _handleSkip() async {
    final crisisProvider = context.read<CrisisProvider>();
    await crisisProvider.skipReflection(widget.crisisId);

    if (mounted) {
      Navigator.of(context).popUntil((route) => route.isFirst);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1E293B),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        foregroundColor: const Color(0xFFF1F5F9),
        automaticallyImplyLeading: false,
        title: const Text('Reflexión'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(24.0),
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF334155),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Row(
                children: [
                  Icon(Icons.lock_outline, color: Color(0xFF94A3B8), size: 20),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Esta información es solo para ti y, si quieres, para compartir con tu terapeuta.',
                      style: TextStyle(
                        color: Color(0xFF94A3B8),
                        fontSize: 13,
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            const Text(
              '¿Qué pasó antes de la crisis?',
              style: TextStyle(
                color: Color(0xFFF1F5F9),
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            TextFormField(
              controller: _triggerController,
              minLines: 2,
              maxLines: 4,
              style: const TextStyle(color: Color(0xFFF1F5F9)),
              decoration: InputDecoration(
                hintText: 'Ej: Discutí con mi hermano',
                hintStyle: const TextStyle(color: Color(0xFF64748B)),
                filled: true,
                fillColor: const Color(0xFF334155),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF5EEAD4)),
                ),
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Este campo es obligatorio';
                }
                return null;
              },
            ),
            const SizedBox(height: 28),
            _buildRadioSection(
              title: '¿Dónde estabas?',
              options: _locationOptions,
              selected: _selectedLocation,
              onChanged: (val) => setState(() => _selectedLocation = val),
              showOtherInput: _selectedLocation == 'Otro',
              otherController: _otherLocationController,
            ),
            const SizedBox(height: 28),
            _buildRadioSection(
              title: '¿Con quién estabas?',
              options: _companyOptions,
              selected: _selectedCompany,
              onChanged: (val) => setState(() => _selectedCompany = val),
              showOtherInput: _selectedCompany == 'Otro',
              otherController: _otherCompanyController,
            ),
            const SizedBox(height: 28),
            _buildRadioSection(
              title: '¿Consumiste alguna sustancia? (sin juicio)',
              options: _substanceOptions,
              selected: _selectedSubstance,
              onChanged: (val) => setState(() => _selectedSubstance = val),
            ),
            const SizedBox(height: 40),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isSaving ? null : _handleSave,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF5EEAD4),
                  foregroundColor: const Color(0xFF1E293B),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isSaving
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text(
                        'Guardar Reflexión',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
              ),
            ),
            const SizedBox(height: 16),
            Center(
              child: TextButton(
                onPressed: _isSaving ? null : _handleSkip,
                child: const Text(
                  'Omitir por ahora',
                  style: TextStyle(
                    color: Color(0xFF64748B),
                    fontSize: 14,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildRadioSection({
    required String title,
    required List<String> options,
    required String? selected,
    required ValueChanged<String?> onChanged,
    bool showOtherInput = false,
    TextEditingController? otherController,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            color: Color(0xFFF1F5F9),
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 8),
        ...options.map((option) {
          return RadioListTile<String>(
            value: option,
            groupValue: selected,
            onChanged: onChanged,
            title: Text(
              option,
              style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 14),
            ),
            activeColor: const Color(0xFF5EEAD4),
            dense: true,
            contentPadding: EdgeInsets.zero,
            visualDensity: VisualDensity.compact,
          );
        }),
        if (showOtherInput && otherController != null)
          Padding(
            padding: const EdgeInsets.only(left: 16, top: 4),
            child: TextFormField(
              controller: otherController,
              style: const TextStyle(color: Color(0xFFF1F5F9), fontSize: 14),
              decoration: InputDecoration(
                hintText: 'Especifica...',
                hintStyle: const TextStyle(color: Color(0xFF64748B)),
                filled: true,
                fillColor: const Color(0xFF334155),
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 10,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),
      ],
    );
  }
}
